import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FIREBASE_ADMIN_APP } from './firebase-admin.provider';

export type DecodedFirebaseUser = {
  firebaseUid: string;
  email: string | null;
  name: string | null;
  authTime: Date | null;
};

@Injectable()
export class FirebaseTokenService {
  constructor(@Inject(FIREBASE_ADMIN_APP) private readonly firebaseApp: App) {}

  async verifyIdToken(idToken: string): Promise<DecodedFirebaseUser> {
    try {
      const decoded = await getAuth(this.firebaseApp).verifyIdToken(idToken);

      const authTimeSeconds =
        typeof decoded.auth_time === 'number'
          ? decoded.auth_time
          : typeof decoded.auth_time === 'string'
            ? Number(decoded.auth_time)
            : null;

      return {
        firebaseUid: decoded.uid,
        email: typeof decoded.email === 'string' ? decoded.email : null,
        name: typeof decoded.name === 'string' ? decoded.name : null,
        authTime:
          authTimeSeconds !== null && Number.isFinite(authTimeSeconds)
            ? new Date(authTimeSeconds * 1000)
            : null,
      };
    } catch {
      throw new UnauthorizedException('Token do Firebase inválido ou expirado.');
    }
  }
}