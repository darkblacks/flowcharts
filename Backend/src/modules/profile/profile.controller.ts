import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AppSessionGuard } from '../../common/guards/app-session.guard';
import { CurrentSession, CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentAppSession, CurrentAppUser } from '../../common/interfaces/request-context.interface';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
@UseGuards(AppSessionGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async me(
    @CurrentUser() appUser: CurrentAppUser,
    @CurrentSession() appSession: CurrentAppSession,
  ) {
    return this.profileService.me(appUser, appSession);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() appUser: CurrentAppUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateMe(appUser, dto);
  }
}
