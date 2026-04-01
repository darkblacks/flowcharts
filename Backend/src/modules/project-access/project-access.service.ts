import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import type {
  CurrentAppSession,
  CurrentAppUser,
} from '../../common/interfaces/request-context.interface';
import { ProjectAccessRepository } from '../database/repositories/project-access.repository';
import { UnlockProjectDto } from './dto/unlock-project.dto';

@Injectable()
export class ProjectAccessService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly projectAccessRepository: ProjectAccessRepository,
  ) {}

  async unlock(
    appUser: CurrentAppUser,
    appSession: CurrentAppSession,
    dto: UnlockProjectDto,
  ) {
    if (!dto.projectId && !dto.projectSlug) {
      throw new BadRequestException('Informe projectId ou projectSlug.');
    }

    const project = dto.projectId
      ? await this.projectAccessRepository.findProjectById(dto.projectId)
      : await this.projectAccessRepository.findProjectBySlug(dto.projectSlug!);

    if (!project) {
      throw new NotFoundException('Projeto não encontrado.');
    }

    if (project.status !== 'active' || project.setup_status !== 'ready') {
      throw new ForbiddenException('Projeto ainda não está pronto para acesso.');
    }

    const member = await this.projectAccessRepository.findActiveMember({
      projectId: project.id,
      userId: appUser.id,
    });

    if (!member) {
      throw new ForbiddenException('Usuário não possui acesso ativo a este projeto.');
    }

    const secret = await this.projectAccessRepository.findActiveSecret(project.id);
    if (!secret) {
      throw new ForbiddenException('Projeto sem segredo de acesso ativo.');
    }

    const normalizedCode = dto.code.trim();
    const codeHash = createHash('sha256').update(normalizedCode).digest('hex');
    if (codeHash !== secret.code_hash) {
      throw new ForbiddenException('Código do projeto inválido.');
    }

    const ttlMinutes = this.configService.get<number>('app.projectAccessTtlMinutes') ?? 120;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();

    const session = await this.projectAccessRepository.createSession({
      projectId: project.id,
      userId: appUser.id,
      appSessionId: appSession.id,
      memberRole: member.role,
      grantedBySecretVersion: secret.version,
      expiresAt,
    });

    const projectAccessToken = await this.jwtService.signAsync(
      {
        sub: appUser.id,
        sid: appSession.id,
        pid: project.id,
        psid: session.id,
        role: member.role,
        type: 'project_access',
      },
      {
        secret: this.configService.getOrThrow<string>('app.jwtSecret'),
        expiresIn: `${ttlMinutes}m`,
      },
    );

    return {
      project,
      member,
      accessSession: session,
      projectAccessToken,
    };
  }

  async me(input: {
    project: Awaited<ReturnType<ProjectAccessRepository['findProjectById']>>;
    session: Awaited<ReturnType<ProjectAccessRepository['findActiveSessionById']>>;
    payload: {
      role: 'author' | 'moderator' | 'viewer';
    };
  }) {
    return {
      project: input.project,
      accessSession: input.session,
      memberRole: input.payload.role,
    };
  }

  async heartbeat(projectAccessSessionId: string) {
    await this.projectAccessRepository.touchSession(projectAccessSessionId);
    return { ok: true };
  }

  async logout(projectAccessSessionId: string) {
    await this.projectAccessRepository.revokeSession({
      projectAccessSessionId,
      reason: 'project_access_logout',
    });

    return { ok: true };
  }
}
