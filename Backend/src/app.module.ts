import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';
import { envSchema } from './config/env.schema';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { ProfileModule } from './modules/profile/profile.module';
import { BillingModule } from './modules/billing/billing.module';
import { BillingWebhooksModule } from './modules/billing-webhooks/billing-webhooks.module';
import { ProjectsModule } from './modules/projects/projects.module';

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
  ],
})
export class AppModule {}
