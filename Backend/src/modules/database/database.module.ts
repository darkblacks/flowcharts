import { Module } from '@nestjs/common';
import { SupabaseProvider } from './supabase.provider';
import { AppUsersRepository } from './repositories/app-users.repository';
import { AppSessionsRepository } from './repositories/app-sessions.repository';
import { PresenceRepository } from './repositories/presence.repository';
import { SubscriptionsRepository } from './repositories/subscriptions.repository';
import { ProfileRepository } from './repositories/profile.repository';
import { AdminRepository } from './repositories/admin.repository';
import { BillingRepository } from './repositories/billing.repository';
import { ActivationKeysRepository } from './repositories/activation-keys.repository';
import { ProjectsRepository } from './repositories/projects.repository';
import { ProvisioningRepository } from './repositories/provisioning.repository';

@Module({
  providers: [
    SupabaseProvider,
    AppUsersRepository,
    AppSessionsRepository,
    PresenceRepository,
    SubscriptionsRepository,
    ProfileRepository,
    AdminRepository,
    BillingRepository,
    ActivationKeysRepository,
    ProjectsRepository,
    ProvisioningRepository,
  ],
  exports: [
    SupabaseProvider,
    AppUsersRepository,
    AppSessionsRepository,
    PresenceRepository,
    SubscriptionsRepository,
    ProfileRepository,
    AdminRepository,
    BillingRepository,
    ActivationKeysRepository,
    ProjectsRepository,
    ProvisioningRepository,
  ],
})
export class DatabaseModule {}
