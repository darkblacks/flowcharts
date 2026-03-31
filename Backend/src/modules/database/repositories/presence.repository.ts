import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase.provider';

@Injectable()
export class PresenceRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async markOnline(input: { userId: string; sessionId: string; ttlMinutes?: number }): Promise<void> {
    const now = new Date();
    const ttlMinutes = input.ttlMinutes ?? 2;
    const heartbeatExpiresAt = new Date(now.getTime() + ttlMinutes * 60_000).toISOString();

    const { error } = await this.supabase.from('user_presence').upsert(
      {
        user_id: input.userId,
        current_session_id: input.sessionId,
        is_online: true,
        last_seen_at: now.toISOString(),
        heartbeat_expires_at: heartbeatExpiresAt,
      },
      {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      },
    );

    if (error) {
      throw new InternalServerErrorException('Falha ao marcar presença online.');
    }
  }

  async markOffline(input: { userId: string; sessionId?: string | null }): Promise<void> {
    const { error } = await this.supabase
      .from('user_presence')
      .update({
        is_online: false,
        last_seen_at: new Date().toISOString(),
        heartbeat_expires_at: null,
        current_session_id: input.sessionId ?? null,
      })
      .eq('user_id', input.userId);

    if (error) {
      throw new InternalServerErrorException('Falha ao marcar presença offline.');
    }
  }
}
