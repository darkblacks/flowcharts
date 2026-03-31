import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedRequestContext } from '../interfaces/request-context.interface';

type RequestWithAuth = Request & {
  auth?: AuthenticatedRequestContext;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuth>();
    const appUser = request.auth?.appUser;

    if (!appUser) {
      throw new UnauthorizedException('Usuário autenticado não encontrado.');
    }

    return appUser;
  },
);

export const CurrentSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuth>();
    const appSession = request.auth?.appSession;

    if (!appSession) {
      throw new UnauthorizedException('Sessão autenticada não encontrada.');
    }

    return appSession;
  },
);