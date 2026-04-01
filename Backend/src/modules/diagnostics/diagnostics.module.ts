import { Module } from '@nestjs/common';
import { CloudflareModule } from '../cloudflare/cloudflare.module';
import { DatabaseModule } from '../database/database.module';
import { DiagnosticsController } from './diagnostics.controller';
import { DiagnosticsService } from './diagnostics.service';

@Module({
  imports: [DatabaseModule, CloudflareModule],
  controllers: [DiagnosticsController],
  providers: [DiagnosticsService],
})
export class DiagnosticsModule {}
