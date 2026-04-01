import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ProjectAccessController } from './project-access.controller';
import { ProjectAccessService } from './project-access.service';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ProjectAccessController],
  providers: [ProjectAccessService, ProjectAccessGuard],
})
export class ProjectAccessModule {}
