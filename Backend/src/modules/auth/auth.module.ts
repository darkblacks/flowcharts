import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAdminProvider } from './firebase-admin.provider';
import { FirebaseTokenService } from './firebase-token.service';
import { DatabaseModule } from '../database/database.module';
import { AppSessionGuard } from '../../common/guards/app-session.guard';

@Module({
  imports: [JwtModule.register({}), DatabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    FirebaseAdminProvider,
    FirebaseTokenService,
    AppSessionGuard,
  ],
  exports: [
    AuthService,
    FirebaseTokenService,
    AppSessionGuard,
    JwtModule,
  ],
})
export class AuthModule {}