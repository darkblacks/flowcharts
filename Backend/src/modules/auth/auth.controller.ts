import { Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { AppSessionGuard } from '../../common/guards/app-session.guard';
import { CurrentSession, CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentAppSession, CurrentAppUser } from '../../common/interfaces/request-context.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('session')
  async createSession(@Req() request: Request) {
    const token = this.extractFirebaseIdToken(request);
    return this.authService.createSession(token, request);
  }

  @UseGuards(AppSessionGuard)
  @Get('me')
  async me(
    @CurrentUser() appUser: CurrentAppUser,
    @CurrentSession() appSession: CurrentAppSession,
  ) {
    return this.authService.me(appUser, appSession);
  }

  @UseGuards(AppSessionGuard)
  @Post('heartbeat')
  async heartbeat(
    @CurrentUser() appUser: CurrentAppUser,
    @CurrentSession() appSession: CurrentAppSession,
  ) {
    return this.authService.heartbeat(appUser, appSession);
  }

  @UseGuards(AppSessionGuard)
  @Post('logout')
  async logout(
    @CurrentUser() appUser: CurrentAppUser,
    @CurrentSession() appSession: CurrentAppSession,
  ) {
    return this.authService.logout(appUser, appSession);
  }

  private extractFirebaseIdToken(request: Request): string {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token do Firebase ausente.');
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException('Token do Firebase ausente.');
    }

    return token;
  }
}