import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CloudflareModule } from '../cloudflare/cloudflare.module';
import { DatabaseModule } from '../database/database.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [DatabaseModule, AuthModule, CloudflareModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
