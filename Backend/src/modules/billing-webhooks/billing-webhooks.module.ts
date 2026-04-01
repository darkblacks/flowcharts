import { Module } from '@nestjs/common';
import { BillingWebhooksController } from './billing-webhooks.controller';
import { BillingWebhooksService } from './billing-webhooks.service';
import { DatabaseModule } from '../database/database.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [DatabaseModule, BillingModule],
  controllers: [BillingWebhooksController],
  providers: [BillingWebhooksService],
})
export class BillingWebhooksModule {}
