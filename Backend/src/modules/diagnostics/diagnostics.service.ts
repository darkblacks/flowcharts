import { Injectable } from '@nestjs/common';
import type {
  CurrentAppSession,
  CurrentAppUser,
} from '../../common/interfaces/request-context.interface';
import { CloudflareR2Service } from '../cloudflare/cloudflare-r2.service';
import { AdminRepository } from '../database/repositories/admin.repository';
import { AppUsersRepository } from '../database/repositories/app-users.repository';

@Injectable()
export class DiagnosticsService {
  constructor(
    private readonly cloudflareR2Service: CloudflareR2Service,
    private readonly appUsersRepository: AppUsersRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  ping() {
    return {
      ok: true,
      service: 'flowcharts-backend',
      timestamp: new Date().toISOString(),
    };
  }

  async authState(appUser: CurrentAppUser, appSession: CurrentAppSession) {
    const [freshUser, enrollment, elevation] = await Promise.all([
      this.appUsersRepository.findById(appUser.id),
      this.adminRepository.findEnrollmentByUserId(appUser.id),
      this.adminRepository.findActiveElevationByUserAndSession({
        userId: appUser.id,
        sessionId: appSession.id,
      }),
    ]);

    return {
      user: freshUser,
      appSession,
      admin: {
        isEligible: Boolean(enrollment?.is_enabled),
        hasActiveElevation: Boolean(elevation),
        scopes: enrollment?.scopes ?? [],
      },
    };
  }

  async r2() {
    return this.cloudflareR2Service.runWriteDeleteHealthcheck();
  }
}
