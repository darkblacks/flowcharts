import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase.provider';

@Injectable()
export class ProfileRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async findProjectsByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('project_members')
      .select(
        `
          id,
          role,
          status,
          joined_at,
          project:projects (
            id,
            owner_user_id,
            name,
            slug,
            status,
            setup_status,
            created_at,
            updated_at
          )
        `,
      )
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar projetos do perfil.');
    }

    return (data ?? []).map((item: any) => ({
      memberId: item.id,
      role: item.role,
      status: item.status,
      joinedAt: item.joined_at,
      project: {
        id: item.project.id,
        ownerUserId: item.project.owner_user_id,
        name: item.project.name,
        slug: item.project.slug,
        status: item.project.status,
        setupStatus: item.project.setup_status,
        createdAt: item.project.created_at,
        updatedAt: item.project.updated_at,
      },
    }));
  }

  async findPresenceByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('user_presence')
      .select('is_online, last_seen_at, heartbeat_expires_at, current_session_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar presença do usuário.');
    }

    return data;
  }
}
