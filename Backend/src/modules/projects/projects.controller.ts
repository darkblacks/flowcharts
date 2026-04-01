import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AppSessionGuard } from '../../common/guards/app-session.guard';
import type { CurrentAppUser } from '../../common/interfaces/request-context.interface';
import { ActivateProjectDto } from './dto/activate-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(AppSessionGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('test/ping')
  async ping() {
    return this.projectsService.testPing();
  }

  @Get('test/r2')
  async testR2() {
    return this.projectsService.testR2Connection();
  }

  @Get('test/bootstrap/:projectId')
  async inspectBootstrap(
    @CurrentUser() appUser: CurrentAppUser,
    @Param('projectId') projectId: string,
  ) {
    return this.projectsService.inspectBootstrap(appUser, projectId);
  }

  @Post('test/bootstrap/:projectId/rebuild')
  async rebuildBootstrap(
    @CurrentUser() appUser: CurrentAppUser,
    @Param('projectId') projectId: string,
  ) {
    return this.projectsService.rebuildBootstrap(appUser, projectId);
  }

  @Post('activate')
  async activate(@CurrentUser() appUser: CurrentAppUser, @Body() dto: ActivateProjectDto) {
    return this.projectsService.activate(appUser, dto);
  }
}
