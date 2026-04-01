import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { envSchema } from './config/env.schema';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { BillingModule } from './modules/billing/billing.module';
import { BillingWebhooksModule } from './modules/billing-webhooks/billing-webhooks.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AdminModule } from './modules/admin/admin.module';
import { ProjectAccessModule } from './modules/project-access/project-access.module';
import { DiagnosticsModule } from './modules/diagnostics/diagnostics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envSchema,
      expandVariables: true,
    }),
    DatabaseModule,
    AuthModule,
    ProfileModule,
    BillingModule,
    BillingWebhooksModule,
    ProjectsModule,
    AdminModule,
    ProjectAccessModule,
    DiagnosticsModule,
  ],
})
export class AppModule {}
