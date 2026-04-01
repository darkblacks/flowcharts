import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentSession, CurrentUser } from '../../common/decorators/current-user.decorator';
import { AppSessionGuard } from '../../common/guards/app-session.guard';
import type {
  CurrentAppSession,
  CurrentAppUser,
} from '../../common/interfaces/request-context.interface';
import { DiagnosticsService } from './diagnostics.service';

@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Get('ping')
  async ping() {
    return this.diagnosticsService.ping();
  }

  @Get('auth')
  @UseGuards(AppSessionGuard)
  async auth(
    @CurrentUser() appUser: CurrentAppUser,
    @CurrentSession() appSession: CurrentAppSession,
  ) {
    return this.diagnosticsService.authState(appUser, appSession);
  }

  @Get('r2')
  async r2() {
    return this.diagnosticsService.r2();
  }
}
