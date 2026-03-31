import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase.provider';
import { CurrentAppSession } from '../../../common/interfaces/request-context.interface';

type AppSessionRow = {
  id: string;
  user_id: string;
  status: 'active' | 'logged_out' | 'revoked' | 'expired';
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  last_heartbeat_at: string;
  last_seen_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  revoked_reason: string | null;
};

@Injectable()
export class AppSessionsRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async create(input: {
    userId: string;
    ipAddress: string | null;
    userAgent: string | null;
    expiresAt: string | null;
  }): Promise<CurrentAppSession> {
    const { data, error } = await this.supabase
      .from('app_sessions')
      .insert({
        user_id: input.userId,
        ip_address: input.ipAddress,
        user_agent: input.userAgent,
        expires_at: input.expiresAt,
      })
      .select('*')
      .single<AppSessionRow>();

    if (error || !data) {
      throw new InternalServerErrorException('Falha ao criar sessão do app.');
    }

    return this.mapRow(data);
  }

  async findActiveById(id: string): Promise<CurrentAppSession | null> {
    const { data, error } = await this.supabase
      .from('app_sessions')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .maybeSingle<AppSessionRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar sessão do app.');
    }

    if (!data) return null;

    if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) {
      return null;
    }

    return this.mapRow(data);
  }

  async touchHeartbeat(sessionId: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.supabase
      .from('app_sessions')
      .update({
        last_heartbeat_at: now,
        last_seen_at: now,
      })
      .eq('id', sessionId)
      .eq('status', 'active');

    if (error) {
      throw new InternalServerErrorException('Falha ao atualizar heartbeat da sessão.');
    }
  }

  async logout(sessionId: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.supabase
      .from('app_sessions')
      .update({
        status: 'logged_out',
        revoked_at: now,
        revoked_reason: 'user_logout',
        last_seen_at: now,
      })
      .eq('id', sessionId);

    if (error) {
      throw new InternalServerErrorException('Falha ao encerrar sessão do app.');
    }
  }

  private mapRow(row: AppSessionRow): CurrentAppSession {
    return {
      id: row.id,
      userId: row.user_id,
      status: row.status,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
      lastHeartbeatAt: row.last_heartbeat_at,
      lastSeenAt: row.last_seen_at,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
      revokedReason: row.revoked_reason,
    };
  }
}
