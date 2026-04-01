import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { ProjectAccessRepository } from '../../modules/database/repositories/project-access.repository';

type ProjectAccessJwtPayload = {
  sub: string;
  sid: string;
  pid: string;
  psid: string;
  role: 'author' | 'moderator' | 'viewer';
  type: 'project_access';
};

type RequestWithProjectAccess = Request & {
  projectAccess?: {
    payload: ProjectAccessJwtPayload;
    session: Awaited<ReturnType<ProjectAccessRepository['findActiveSessionById']>>;
    project: Awaited<ReturnType<ProjectAccessRepository['findProjectById']>>;
  };
};

@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly projectAccessRepository: ProjectAccessRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithProjectAccess>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de acesso ao projeto ausente.');
    }

    let payload: ProjectAccessJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<ProjectAccessJwtPayload>(token, {
        secret: this.configService.get<string>('app.jwtSecret'),
      });
    } catch {
      throw new UnauthorizedException('Token de acesso ao projeto inválido ou expirado.');
    }

    if (payload.type !== 'project_access' || !payload.psid || !payload.pid || !payload.sub) {
      throw new UnauthorizedException('Payload do token de projeto inválido.');
    }

    const session = await this.projectAccessRepository.findActiveSessionById(payload.psid);
    if (
      !session ||
      session.project_id !== payload.pid ||
      session.user_id !== payload.sub ||
      session.app_session_id !== payload.sid
    ) {
      throw new UnauthorizedException('Sessão de acesso ao projeto inválida.');
    }

    const project = await this.projectAccessRepository.findProjectById(payload.pid);
    if (!project) {
      throw new UnauthorizedException('Projeto do token não encontrado.');
    }

    request.projectAccess = {
      payload,
      session,
      project,
    };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.slice(7).trim();
    return token.length > 0 ? token : null;
  }
}
