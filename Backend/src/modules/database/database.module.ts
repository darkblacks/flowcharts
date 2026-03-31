import { Module } from '@nestjs/common';
import { SupabaseProvider } from './supabase.provider';
import { AppUsersRepository } from './repositories/app-users.repository';
import { AppSessionsRepository } from './repositories/app-sessions.repository';
import { PresenceRepository } from './repositories/presence.repository';
import { SubscriptionsRepository } from './repositories/subscriptions.repository';
import { ProfileRepository } from './repositories/profile.repository';
import { AdminRepository } from './repositories/admin.repository';

@Module({
  providers: [
    SupabaseProvider,
    AppUsersRepository,
    AppSessionsRepository,
    PresenceRepository,
    SubscriptionsRepository,
    ProfileRepository,
    AdminRepository,
  ],
  exports: [
    SupabaseProvider,
    AppUsersRepository,
    AppSessionsRepository,
    PresenceRepository,
    SubscriptionsRepository,
    ProfileRepository,
    AdminRepository,
  ],
})
export class DatabaseModule {}