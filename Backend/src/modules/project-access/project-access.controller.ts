import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentSession, CurrentUser } from '../../common/decorators/current-user.decorator';
import { AppSessionGuard } from '../../common/guards/app-session.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';
import type {
  CurrentAppSession,
  CurrentAppUser,
} from '../../common/interfaces/request-context.interface';
import { UnlockProjectDto } from './dto/unlock-project.dto';
import { ProjectAccessService } from './project-access.service';

type RequestWithProjectAccess = Request & {
  projectAccess?: {
    payload: {
      role: 'author' | 'moderator' | 'viewer';
    };
    session: {
      id: string;
    };
    project: unknown;
  };
};

@Controller('project-access')
export class ProjectAccessController {
  constructor(private readonly projectAccessService: ProjectAccessService) {}

  @Post('unlock')
  @UseGuards(AppSessionGuard)
  async unlock(
    @CurrentUser() appUser: CurrentAppUser,
    @CurrentSession() appSession: CurrentAppSession,
    @Body() dto: UnlockProjectDto,
  ) {
    return this.projectAccessService.unlock(appUser, appSession, dto);
  }

  @Get('me')
  @UseGuards(ProjectAccessGuard)
  async me(@Req() request: RequestWithProjectAccess) {
    return this.projectAccessService.me({
      project: request.projectAccess?.project ?? null,
      session: request.projectAccess?.session ?? null,
      payload: request.projectAccess?.payload ?? { role: 'viewer' },
    });
  }

  @Post('heartbeat')
  @UseGuards(ProjectAccessGuard)
  async heartbeat(@Req() request: RequestWithProjectAccess) {
    return this.projectAccessService.heartbeat(request.projectAccess?.session?.id ?? '');
  }

  @Post('logout')
  @UseGuards(ProjectAccessGuard)
  async logout(@Req() request: RequestWithProjectAccess) {
    return this.projectAccessService.logout(request.projectAccess?.session?.id ?? '');
  }
}
