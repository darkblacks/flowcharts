import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentSession, CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminElevationGuard } from '../../common/guards/admin-elevation.guard';
import { AppSessionGuard } from '../../common/guards/app-session.guard';
import type {
  CurrentAppSession,
  CurrentAppUser,
} from '../../common/interfaces/request-context.interface';
import { AdminService } from './admin.service';
import { ElevateAdminDto } from './dto/elevate-admin.dto';
import { SetAdminEnrollmentDto } from './dto/set-admin-enrollment.dto';

type RequestWithAdmin = Request & {
  admin?: {
    elevation?: {
      id: string;
    };
  };
};

@Controller('admin')
@UseGuards(AppSessionGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('status')
  async status(
    @CurrentUser() appUser: CurrentAppUser,
    @CurrentSession() appSession: CurrentAppSession,
  ) {
    return this.adminService.status(appUser, appSession);
  }

  @Post('elevate')
  async elevate(
    @CurrentUser() appUser: CurrentAppUser,
    @CurrentSession() appSession: CurrentAppSession,
    @Body() dto: ElevateAdminDto,
  ) {
    return this.adminService.elevate(appUser, appSession, dto);
  }

  @Post('elevation/logout')
  async logoutElevation(
    @CurrentUser() appUser: CurrentAppUser,
    @CurrentSession() appSession: CurrentAppSession,
  ) {
    return this.adminService.logoutElevation(appUser, appSession);
  }

  @Get('enrollments')
  @UseGuards(AdminElevationGuard)
  async listAdmins() {
    return this.adminService.listAdmins();
  }

  @Post('enrollments/grant')
  @UseGuards(AdminElevationGuard)
  async grantAdmin(
    @Req() request: RequestWithAdmin,
    @CurrentUser() appUser: CurrentAppUser,
    @CurrentSession() appSession: CurrentAppSession,
    @Body() dto: SetAdminEnrollmentDto,
  ) {
    return this.adminService.grantAdmin(
      appUser,
      appSession,
      request.admin?.elevation?.id ?? '',
      dto,
    );
  }

  @Post('enrollments/revoke')
  @UseGuards(AdminElevationGuard)
  async revokeAdmin(
    @Req() request: RequestWithAdmin,
    @CurrentUser() appUser: CurrentAppUser,
    @CurrentSession() appSession: CurrentAppSession,
    @Body() dto: SetAdminEnrollmentDto,
  ) {
    return this.adminService.revokeAdmin(
      appUser,
      appSession,
      request.admin?.elevation?.id ?? '',
      dto,
    );
  }
}
