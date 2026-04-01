import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  CurrentAppSession,
  CurrentAppUser,
} from '../../common/interfaces/request-context.interface';
import { FirebaseTokenService } from '../auth/firebase-token.service';
import { AdminRepository } from '../database/repositories/admin.repository';
import { AppUsersRepository } from '../database/repositories/app-users.repository';
import { ElevateAdminDto } from './dto/elevate-admin.dto';
import { SetAdminEnrollmentDto } from './dto/set-admin-enrollment.dto';

const DEFAULT_ADMIN_SCOPES = [
  'admin.enrollments.manage',
  'admin.elevation.manage',
  'admin.online.read',
  'admin.sessions.revoke',
];

@Injectable()
export class AdminService {
  constructor(
    private readonly firebaseTokenService: FirebaseTokenService,
    private readonly adminRepository: AdminRepository,
    private readonly appUsersRepository: AppUsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async status(appUser: CurrentAppUser, appSession: CurrentAppSession) {
    const [enrollment, activeElevation] = await Promise.all([
      this.adminRepository.findEnrollmentByUserId(appUser.id),
      this.adminRepository.findActiveElevationByUserAndSession({
        userId: appUser.id,
        sessionId: appSession.id,
      }),
    ]);

    return {
      userId: appUser.id,
      isEligible: Boolean(enrollment?.is_enabled),
      scopes: enrollment?.scopes ?? [],
      hasActiveElevation: Boolean(activeElevation),
      elevationExpiresAt: activeElevation?.expires_at ?? null,
    };
  }

  async elevate(
    appUser: CurrentAppUser,
    appSession: CurrentAppSession,
    dto: ElevateAdminDto,
  ) {
    const enrollment = await this.adminRepository.findEnrollmentByUserId(appUser.id);

    if (!enrollment?.is_enabled) {
      throw new ForbiddenException('Usuário não está habilitado para admin.');
    }

    const decoded = await this.firebaseTokenService.verifyIdToken(dto.firebaseIdToken);

    if (decoded.firebaseUid !== appUser.firebaseUid) {
      throw new ForbiddenException('O token de reautenticação não pertence ao usuário atual.');
    }

    if (!decoded.authTime) {
      throw new ForbiddenException('O token do Firebase não trouxe auth_time válido.');
    }

    const maxAgeSeconds = this.configService.get<number>('admin.reauthMaxAgeSeconds') ?? 300;
    const ageSeconds = Math.floor((Date.now() - decoded.authTime.getTime()) / 1000);
    if (ageSeconds > maxAgeSeconds) {
      throw new ForbiddenException(
        'A confirmação admin expirou. Reautentique no Firebase e tente novamente.',
      );
    }

    await this.adminRepository.revokeActiveElevationsForSession({
      userId: appUser.id,
      sessionId: appSession.id,
      reason: 'replaced_by_new_elevation',
    });

    const ttlMinutes = this.configService.get<number>('admin.elevationTtlMinutes') ?? 30;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();

    const elevation = await this.adminRepository.createElevationSession({
      userId: appUser.id,
      appSessionId: appSession.id,
      firebaseUid: decoded.firebaseUid,
      firebaseAuthTime: decoded.authTime.toISOString(),
      expiresAt,
    });

    await this.adminRepository.createAuditLog({
      actorUserId: appUser.id,
      actorAppSessionId: appSession.id,
      actorAdminElevationSessionId: elevation.id,
      action: 'admin.elevation.start',
      metadata: {
        firebaseAuthTime: decoded.authTime.toISOString(),
        expiresAt,
      },
    });

    return {
      ok: true,
      elevation,
      scopes: enrollment.scopes,
    };
  }

  async logoutElevation(appUser: CurrentAppUser, appSession: CurrentAppSession) {
    const activeElevation = await this.adminRepository.findActiveElevationByUserAndSession({
      userId: appUser.id,
      sessionId: appSession.id,
    });

    if (!activeElevation) {
      return { ok: true, alreadyLoggedOut: true };
    }

    await this.adminRepository.revokeElevationById({
      elevationId: activeElevation.id,
      reason: 'admin_logout',
    });

    await this.adminRepository.createAuditLog({
      actorUserId: appUser.id,
      actorAppSessionId: appSession.id,
      actorAdminElevationSessionId: activeElevation.id,
      action: 'admin.elevation.end',
      metadata: {
        reason: 'admin_logout',
      },
    });

    return { ok: true };
  }

  async listAdmins() {
    return this.adminRepository.listEnabledEnrollments();
  }

  async grantAdmin(
    actor: CurrentAppUser,
    actorSession: CurrentAppSession,
    actorElevationId: string,
    dto: SetAdminEnrollmentDto,
  ) {
    const target = await this.resolveTargetUser(dto);
    const enrollment = await this.adminRepository.upsertEnrollment({
      userId: target.id,
      isEnabled: true,
      scopes: dto.scopes?.length ? dto.scopes : DEFAULT_ADMIN_SCOPES,
    });

    await this.adminRepository.createAuditLog({
      actorUserId: actor.id,
      actorAppSessionId: actorSession.id,
      actorAdminElevationSessionId: actorElevationId,
      action: 'admin.enrollment.grant',
      targetUserId: target.id,
      metadata: {
        scopes: enrollment.scopes,
      },
    });

    return {
      ok: true,
      targetUser: target,
      enrollment,
    };
  }

  async revokeAdmin(
    actor: CurrentAppUser,
    actorSession: CurrentAppSession,
    actorElevationId: string,
    dto: SetAdminEnrollmentDto,
  ) {
    const target = await this.resolveTargetUser(dto);
    const current = await this.adminRepository.findEnrollmentByUserId(target.id);

    const enrollment = await this.adminRepository.upsertEnrollment({
      userId: target.id,
      isEnabled: false,
      scopes: current?.scopes ?? dto.scopes ?? DEFAULT_ADMIN_SCOPES,
    });

    await this.adminRepository.createAuditLog({
      actorUserId: actor.id,
      actorAppSessionId: actorSession.id,
      actorAdminElevationSessionId: actorElevationId,
      action: 'admin.enrollment.revoke',
      targetUserId: target.id,
      metadata: {
        scopes: enrollment.scopes,
      },
    });

    return {
      ok: true,
      targetUser: target,
      enrollment,
    };
  }

  private async resolveTargetUser(dto: SetAdminEnrollmentDto) {
    if (!dto.userId && !dto.email) {
      throw new BadRequestException('Informe userId ou email.');
    }

    const target = dto.userId
      ? await this.appUsersRepository.findById(dto.userId)
      : await this.appUsersRepository.findByEmail(dto.email!);

    if (!target) {
      throw new NotFoundException('Usuário alvo não encontrado.');
    }

    return target;
  }
}
