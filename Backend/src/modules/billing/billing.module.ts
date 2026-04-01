import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { MercadoPagoApiService } from './mercado-pago-api.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [BillingController],
  providers: [BillingService, MercadoPagoApiService],
  exports: [BillingService, MercadoPagoApiService],
})
export class BillingModule {}
