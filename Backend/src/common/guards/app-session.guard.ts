import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AppSessionsRepository } from '../../modules/database/repositories/app-sessions.repository';
import { AppUsersRepository } from '../../modules/database/repositories/app-users.repository';
import { AuthenticatedRequestContext } from '../interfaces/request-context.interface';

type AppJwtPayload = {
  sub: string;
  sid: string;
  firebaseUid: string;
  role: string;
  type: 'app_access';
};

type RequestWithAuth = Request & {
  auth?: AuthenticatedRequestContext;
};

@Injectable()
export class AppSessionGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly appSessionsRepository: AppSessionsRepository,
    private readonly appUsersRepository: AppUsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token do app ausente.');
    }

    let payload: AppJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<AppJwtPayload>(token, {
        secret: this.configService.get<string>('app.jwtSecret'),
      });
    } catch {
      throw new UnauthorizedException('Token do app inválido ou expirado.');
    }

    if (payload.type !== 'app_access' || !payload.sub || !payload.sid) {
      throw new UnauthorizedException('Payload do token inválido.');
    }

    const appSession = await this.appSessionsRepository.findActiveById(payload.sid);
    if (!appSession || appSession.userId !== payload.sub) {
      throw new UnauthorizedException('Sessão do app inválida.');
    }

    const appUser = await this.appUsersRepository.findById(payload.sub);
    if (!appUser || appUser.status !== 'active') {
      throw new UnauthorizedException('Usuário inválido ou bloqueado.');
    }

    request.auth = {
      appUser,
      appSession,
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
