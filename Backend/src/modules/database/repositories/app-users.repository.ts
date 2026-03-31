import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase.provider';
import { CurrentAppUser } from '../../../common/interfaces/request-context.interface';

type AppUserRow = {
  id: string;
  firebase_uid: string;
  email: string | null;
  name: string | null;
  birth_date: string | null;
  avatar_url: string | null;
  status: 'active' | 'blocked';
  role: 'user' | 'premium' | 'staff' | 'admin';
  created_at: string;
  updated_at: string;
};

@Injectable()
export class AppUsersRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<CurrentAppUser | null> {
    const { data, error } = await this.supabase
      .from('app_users')
      .select('*')
      .eq('id', id)
      .maybeSingle<AppUserRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar usuário do app.');
    }

    return data ? this.mapRow(data) : null;
  }

  async findByFirebaseUid(firebaseUid: string): Promise<CurrentAppUser | null> {
    const { data, error } = await this.supabase
      .from('app_users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .maybeSingle<AppUserRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar usuário por Firebase UID.');
    }

    return data ? this.mapRow(data) : null;
  }

  async createOrUpdateFromFirebase(input: {
    firebaseUid: string;
    email: string | null;
    name: string | null;
  }): Promise<CurrentAppUser> {
    const { data, error } = await this.supabase
      .from('app_users')
      .upsert(
        {
          firebase_uid: input.firebaseUid,
          email: input.email,
          name: input.name,
        },
        {
          onConflict: 'firebase_uid',
          ignoreDuplicates: false,
        },
      )
      .select('*')
      .single<AppUserRow>();

    if (error || !data) {
      throw new InternalServerErrorException('Falha ao criar/sincronizar usuário do app.');
    }

    return this.mapRow(data);
  }

  async updateOwnProfile(userId: string, input: {
    name?: string;
    birthDate?: string | null;
    avatarUrl?: string | null;
  }): Promise<CurrentAppUser> {
    const patch: Record<string, unknown> = {};

    if (typeof input.name !== 'undefined') patch.name = input.name;
    if (typeof input.birthDate !== 'undefined') patch.birth_date = input.birthDate;
    if (typeof input.avatarUrl !== 'undefined') patch.avatar_url = input.avatarUrl;

    const { data, error } = await this.supabase
      .from('app_users')
      .update(patch)
      .eq('id', userId)
      .select('*')
      .single<AppUserRow>();

    if (error || !data) {
      throw new InternalServerErrorException('Falha ao atualizar perfil do usuário.');
    }

    return this.mapRow(data);
  }

  private mapRow(row: AppUserRow): CurrentAppUser {
    return {
      id: row.id,
      firebaseUid: row.firebase_uid,
      email: row.email,
      name: row.name,
      birthDate: row.birth_date,
      avatarUrl: row.avatar_url,
      status: row.status,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
