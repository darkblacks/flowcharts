import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase.provider';

export type AdminEnrollmentRow = {
  id: string;
  user_id: string;
  is_enabled: boolean;
  scopes: string[];
  created_at: string;
  updated_at: string;
};

export type AdminElevationSessionRow = {
  id: string;
  user_id: string;
  app_session_id: string;
  status: 'active' | 'revoked' | 'expired';
  firebase_auth_time: string;
  firebase_uid: string;
  elevation_method: 'firebase_reauth';
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  revoked_at: string | null;
  revoked_reason: string | null;
};

@Injectable()
export class AdminRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async findEnrollmentByUserId(userId: string): Promise<AdminEnrollmentRow | null> {
    const { data, error } = await this.supabase
      .from('admin_enrollments')
      .select('id, user_id, is_enabled, scopes, created_at, updated_at')
      .eq('user_id', userId)
      .maybeSingle<AdminEnrollmentRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar enrollment admin.');
    }

    return data;
  }

  async findActiveElevationByUserAndSession(input: {
    userId: string;
    sessionId: string;
  }): Promise<AdminElevationSessionRow | null> {
    const { data, error } = await this.supabase
      .from('admin_elevation_sessions')
      .select('*')
      .eq('user_id', input.userId)
      .eq('app_session_id', input.sessionId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<AdminElevationSessionRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar elevação admin ativa.');
    }

    return data;
  }

  async revokeActiveElevationsForSession(input: {
    userId: string;
    sessionId: string;
    reason: string;
  }): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.supabase
      .from('admin_elevation_sessions')
      .update({
        status: 'revoked',
        revoked_at: now,
        revoked_reason: input.reason,
        last_seen_at: now,
      })
      .eq('user_id', input.userId)
      .eq('app_session_id', input.sessionId)
      .eq('status', 'active');

    if (error) {
      throw new InternalServerErrorException('Falha ao revogar elevações admin ativas.');
    }
  }

  async createElevationSession(input: {
    userId: string;
    appSessionId: string;
    firebaseUid: string;
    firebaseAuthTime: string;
    expiresAt: string;
  }): Promise<AdminElevationSessionRow> {
    const { data, error } = await this.supabase
      .from('admin_elevation_sessions')
      .insert({
        user_id: input.userId,
        app_session_id: input.appSessionId,
        status: 'active',
        firebase_auth_time: input.firebaseAuthTime,
        firebase_uid: input.firebaseUid,
        elevation_method: 'firebase_reauth',
        expires_at: input.expiresAt,
      })
      .select('*')
      .single<AdminElevationSessionRow>();

    if (error || !data) {
      throw new InternalServerErrorException('Falha ao criar sessão de elevação admin.');
    }

    return data;
  }

  async revokeElevationById(input: {
    elevationId: string;
    reason: string;
  }): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.supabase
      .from('admin_elevation_sessions')
      .update({
        status: 'revoked',
        revoked_at: now,
        revoked_reason: input.reason,
        last_seen_at: now,
      })
      .eq('id', input.elevationId)
      .eq('status', 'active');

    if (error) {
      throw new InternalServerErrorException('Falha ao revogar sessão admin.');
    }
  }

  async upsertEnrollment(input: {
    userId: string;
    isEnabled: boolean;
    scopes: string[];
  }): Promise<AdminEnrollmentRow> {
    const payload = {
      user_id: input.userId,
      is_enabled: input.isEnabled,
      scopes: input.scopes,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('admin_enrollments')
      .upsert(payload, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select('id, user_id, is_enabled, scopes, created_at, updated_at')
      .single<AdminEnrollmentRow>();

    if (error || !data) {
      throw new InternalServerErrorException('Falha ao atualizar enrollment admin.');
    }

    return data;
  }

  async listEnabledEnrollments(): Promise<AdminEnrollmentRow[]> {
    const { data, error } = await this.supabase
      .from('admin_enrollments')
      .select('id, user_id, is_enabled, scopes, created_at, updated_at')
      .eq('is_enabled', true)
      .order('created_at', { ascending: true });

    if (error) {
      throw new InternalServerErrorException('Falha ao listar admins.');
    }

    return (data ?? []) as AdminEnrollmentRow[];
  }

  async createAuditLog(input: {
    actorUserId: string;
    actorAppSessionId: string | null;
    actorAdminElevationSessionId: string | null;
    action: string;
    targetUserId?: string | null;
    targetAppSessionId?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const { error } = await this.supabase.from('admin_audit_logs').insert({
      actor_user_id: input.actorUserId,
      actor_app_session_id: input.actorAppSessionId,
      actor_admin_elevation_session_id: input.actorAdminElevationSessionId,
      action: input.action,
      target_user_id: input.targetUserId ?? null,
      target_app_session_id: input.targetAppSessionId ?? null,
      metadata: input.metadata ?? {},
    });

    if (error) {
      throw new InternalServerErrorException('Falha ao registrar auditoria admin.');
    }
  }
}
