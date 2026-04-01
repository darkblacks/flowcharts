import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminRepository } from '../../modules/database/repositories/admin.repository';
import type { AuthenticatedRequestContext } from '../interfaces/request-context.interface';

type RequestWithAdmin = Request & {
  auth?: AuthenticatedRequestContext;
  admin?: {
    enrollment: unknown;
    elevation: unknown;
  };
};

@Injectable()
export class AdminElevationGuard implements CanActivate {
  constructor(private readonly adminRepository: AdminRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAdmin>();
    const auth = request.auth;

    if (!auth?.appUser || !auth?.appSession) {
      throw new UnauthorizedException('Sessão do app ausente para contexto admin.');
    }

    const enrollment = await this.adminRepository.findEnrollmentByUserId(auth.appUser.id);
    if (!enrollment?.is_enabled) {
      throw new ForbiddenException('Usuário não possui enrollment admin ativo.');
    }

    const elevation = await this.adminRepository.findActiveElevationByUserAndSession({
      userId: auth.appUser.id,
      sessionId: auth.appSession.id,
    });

    if (!elevation) {
      throw new ForbiddenException(
        'Elevação admin ausente. Refaça a confirmação admin no Firebase.',
      );
    }

    request.admin = {
      enrollment,
      elevation,
    };

    return true;
  }
}
