import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { StringValue } from 'ms';
import { FirebaseTokenService } from './firebase-token.service';
import { AppUsersRepository } from '../database/repositories/app-users.repository';
import { AppSessionsRepository } from '../database/repositories/app-sessions.repository';
import { PresenceRepository } from '../database/repositories/presence.repository';
import { SubscriptionsRepository } from '../database/repositories/subscriptions.repository';
import { AdminRepository } from '../database/repositories/admin.repository';
import type {
  CurrentAppSession,
  CurrentAppUser,
} from '../../common/interfaces/request-context.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseTokenService: FirebaseTokenService,
    private readonly appUsersRepository: AppUsersRepository,
    private readonly appSessionsRepository: AppSessionsRepository,
    private readonly presenceRepository: PresenceRepository,
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly adminRepository: AdminRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createSession(idToken: string, request: Request) {
    const firebaseUser = await this.firebaseTokenService.verifyIdToken(idToken);

    const appUser = await this.appUsersRepository.createOrUpdateFromFirebase({
      firebaseUid: firebaseUser.firebaseUid,
      email: firebaseUser.email,
      name: firebaseUser.name,
    });

    const sessionTtlMinutes =
      this.configService.getOrThrow<number>('app.sessionTtlMinutes');
    const jwtSecret = this.configService.getOrThrow<string>('app.jwtSecret');
    const jwtExpiresIn =
      this.configService.getOrThrow<string>('app.jwtExpiresIn') as StringValue;

    const expiresAt = new Date(
      Date.now() + sessionTtlMinutes * 60_000,
    ).toISOString();

    const appSession = await this.appSessionsRepository.create({
      userId: appUser.id,
      ipAddress: this.extractIp(request),
      userAgent: this.extractUserAgent(request),
      expiresAt,
    });

    await this.presenceRepository.markOnline({
      userId: appUser.id,
      sessionId: appSession.id,
      ttlMinutes: 2,
    });

    const accessToken = await this.jwtService.signAsync(
      {
        sub: appUser.id,
        sid: appSession.id,
        firebaseUid: appUser.firebaseUid,
        role: appUser.role,
        type: 'app_access',
      },
      {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn,
      },
    );

    const activeSubscription =
      await this.subscriptionsRepository.findActiveByUserId(appUser.id);
    const adminEnrollment =
      await this.adminRepository.findEnrollmentByUserId(appUser.id);

    return {
      accessToken,
      user: appUser,
      session: appSession,
      subscription: activeSubscription,
      admin: {
        isEligible: Boolean(adminEnrollment?.is_enabled),
        scopes: adminEnrollment?.scopes ?? [],
      },
    };
  }

  async me(appUser: CurrentAppUser, appSession: CurrentAppSession) {
    const activeSubscription =
      await this.subscriptionsRepository.findActiveByUserId(appUser.id);
    const adminEnrollment =
      await this.adminRepository.findEnrollmentByUserId(appUser.id);
    const activeElevation =
      await this.adminRepository.findActiveElevationByUserAndSession({
        userId: appUser.id,
        sessionId: appSession.id,
      });

    return {
      user: appUser,
      session: appSession,
      subscription: activeSubscription,
      admin: {
        isEligible: Boolean(adminEnrollment?.is_enabled),
        scopes: adminEnrollment?.scopes ?? [],
        hasActiveElevation: Boolean(activeElevation),
        elevationExpiresAt: activeElevation?.expires_at ?? null,
      },
    };
  }

  async heartbeat(appUser: CurrentAppUser, appSession: CurrentAppSession) {
    await this.appSessionsRepository.touchHeartbeat(appSession.id);

    await this.presenceRepository.markOnline({
      userId: appUser.id,
      sessionId: appSession.id,
      ttlMinutes: 2,
    });

    return { ok: true };
  }

  async logout(appUser: CurrentAppUser, appSession: CurrentAppSession) {
    await this.appSessionsRepository.logout(appSession.id);

    await this.presenceRepository.markOffline({
      userId: appUser.id,
      sessionId: null,
    });

    return { ok: true };
  }

  private extractIp(request: Request): string | null {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string' && forwardedFor.trim().length > 0) {
      return forwardedFor.split(',')[0]?.trim() ?? null;
    }

    if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
      return forwardedFor[0]?.trim() ?? null;
    }

    return request.ip ?? null;
  }

  private extractUserAgent(request: Request): string | null {
    const userAgent = request.headers['user-agent'];

    if (typeof userAgent === 'string' && userAgent.trim().length > 0) {
      return userAgent;
    }

    if (Array.isArray(userAgent) && userAgent.length > 0) {
      return userAgent[0] ?? null;
    }

    return null;
  }
}