export interface CurrentAppUser {
  id: string;
  firebaseUid: string;
  email: string | null;
  name: string | null;
  birthDate: string | null;
  avatarUrl: string | null;
  status: 'active' | 'blocked';
  role: 'user' | 'premium' | 'staff' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface CurrentAppSession {
  id: string;
  userId: string;
  status: 'active' | 'logged_out' | 'revoked' | 'expired';
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastHeartbeatAt: string | null;
  lastSeenAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  revokedReason: string | null;
}

export interface AuthenticatedRequestContext {
  appUser: CurrentAppUser;
  appSession: CurrentAppSession;
}