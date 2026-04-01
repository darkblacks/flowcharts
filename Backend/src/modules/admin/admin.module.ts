import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { AdminElevationGuard } from '../../common/guards/admin-elevation.guard';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminService, AdminElevationGuard],
})
export class AdminModule {}
