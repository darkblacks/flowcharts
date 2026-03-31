import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase.provider';

@Injectable()
export class AdminRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async findEnrollmentByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('admin_enrollments')
      .select('id, is_enabled, scopes, created_at, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar enrollment admin.');
    }

    return data;
  }

  async findActiveElevationByUserAndSession(input: { userId: string; sessionId: string }) {
    const { data, error } = await this.supabase
      .from('admin_elevation_sessions')
      .select('*')
      .eq('user_id', input.userId)
      .eq('app_session_id', input.sessionId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar elevação admin ativa.');
    }

    return data;
  }
}
