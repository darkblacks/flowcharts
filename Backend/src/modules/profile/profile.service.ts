import { Injectable } from '@nestjs/common';
import { CurrentAppSession, CurrentAppUser } from '../../common/interfaces/request-context.interface';
import { AppUsersRepository } from '../database/repositories/app-users.repository';
import { SubscriptionsRepository } from '../database/repositories/subscriptions.repository';
import { ProfileRepository } from '../database/repositories/profile.repository';
import { AdminRepository } from '../database/repositories/admin.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly appUsersRepository: AppUsersRepository,
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  async me(appUser: CurrentAppUser, appSession: CurrentAppSession) {
    const [subscription, presence, projects, adminEnrollment, activeElevation] =
      await Promise.all([
        this.subscriptionsRepository.findActiveByUserId(appUser.id),
        this.profileRepository.findPresenceByUserId(appUser.id),
        this.profileRepository.findProjectsByUserId(appUser.id),
        this.adminRepository.findEnrollmentByUserId(appUser.id),
        this.adminRepository.findActiveElevationByUserAndSession({
          userId: appUser.id,
          sessionId: appSession.id,
        }),
      ]);

    return {
      user: appUser,
      subscription,
      presence: presence
        ? {
            isOnline: presence.is_online,
            lastSeenAt: presence.last_seen_at,
            heartbeatExpiresAt: presence.heartbeat_expires_at,
            currentSessionId: presence.current_session_id,
          }
        : null,
      admin: {
        isEligible: Boolean(adminEnrollment?.is_enabled),
        scopes: adminEnrollment?.scopes ?? [],
        hasActiveElevation: Boolean(activeElevation),
        elevationExpiresAt: activeElevation?.expires_at ?? null,
      },
      projects,
    };
  }

  async updateMe(appUser: CurrentAppUser, dto: UpdateProfileDto) {
    return this.appUsersRepository.updateOwnProfile(appUser.id, {
      name: dto.name,
      birthDate: dto.birthDate,
      avatarUrl: dto.avatarUrl,
    });
  }
}
