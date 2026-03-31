import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';

export const FIREBASE_ADMIN_APP = Symbol('FIREBASE_ADMIN_APP');

export const FirebaseAdminProvider: Provider = {
  provide: FIREBASE_ADMIN_APP,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): App => {
    const existing = getApps().find((app) => app.name === 'flowcharts-admin');
    if (existing) return existing;

    const projectId = configService.get<string>('firebase.projectId');
    const clientEmail = configService.get<string>('firebase.clientEmail');
    const privateKeyRaw = configService.get<string>('firebase.privateKey');

    if (!projectId || !clientEmail || !privateKeyRaw) {
      throw new Error('Credenciais do Firebase Admin ausentes.');
    }

    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

    return initializeApp(
      {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      },
      'flowcharts-admin',
    );
  },
};
