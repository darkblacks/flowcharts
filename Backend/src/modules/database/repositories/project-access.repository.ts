import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase.provider';

export type ProjectAccessSessionRow = {
  id: string;
  project_id: string;
  user_id: string;
  app_session_id: string;
  member_role: 'author' | 'moderator' | 'viewer';
  status: 'active' | 'revoked' | 'expired';
  granted_by_secret_version: number | null;
  unlocked_at: string;
  expires_at: string;
  last_seen_at: string;
  revoked_at: string | null;
  revoked_reason: string | null;
};

type ProjectRow = {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  status: 'active' | 'archived' | 'setup_pending' | 'setup_failed';
  setup_status: 'pending' | 'ready' | 'failed';
  created_at: string;
  updated_at: string;
};

type ProjectMemberRow = {
  id: string;
  project_id: string;
  user_id: string;
  role: 'author' | 'moderator' | 'viewer';
  status: 'active' | 'invited' | 'removed' | 'blocked';
  invited_by_user_id: string | null;
  joined_at: string | null;
  created_at: string;
};

type ProjectSecretRow = {
  id: string;
  project_id: string;
  status: 'active' | 'rotated' | 'revoked';
  code_hash: string;
  code_ciphertext: string | null;
  code_hint: string | null;
  version: number;
  created_by_user_id: string;
  created_at: string;
  rotated_at: string | null;
};

@Injectable()
export class ProjectAccessRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async findProjectById(projectId: string): Promise<ProjectRow | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('id, owner_user_id, name, slug, status, setup_status, created_at, updated_at')
      .eq('id', projectId)
      .maybeSingle<ProjectRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar projeto.');
    }

    return data;
  }

  async findProjectBySlug(projectSlug: string): Promise<ProjectRow | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('id, owner_user_id, name, slug, status, setup_status, created_at, updated_at')
      .eq('slug', projectSlug)
      .maybeSingle<ProjectRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar projeto por slug.');
    }

    return data;
  }

  async findActiveMember(input: { projectId: string; userId: string }): Promise<ProjectMemberRow | null> {
    const { data, error } = await this.supabase
      .from('project_members')
      .select('id, project_id, user_id, role, status, invited_by_user_id, joined_at, created_at')
      .eq('project_id', input.projectId)
      .eq('user_id', input.userId)
      .eq('status', 'active')
      .maybeSingle<ProjectMemberRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar membership do projeto.');
    }

    return data;
  }

  async findActiveSecret(projectId: string): Promise<ProjectSecretRow | null> {
    const { data, error } = await this.supabase
      .from('project_access_secrets')
      .select('id, project_id, status, code_hash, code_ciphertext, code_hint, version, created_by_user_id, created_at, rotated_at')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle<ProjectSecretRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar segredo ativo do projeto.');
    }

    return data;
  }

  async createSession(input: {
    projectId: string;
    userId: string;
    appSessionId: string;
    memberRole: 'author' | 'moderator' | 'viewer';
    grantedBySecretVersion: number | null;
    expiresAt: string;
  }): Promise<ProjectAccessSessionRow> {
    const { data, error } = await this.supabase
      .from('project_access_sessions')
      .insert({
        project_id: input.projectId,
        user_id: input.userId,
        app_session_id: input.appSessionId,
        member_role: input.memberRole,
        status: 'active',
        granted_by_secret_version: input.grantedBySecretVersion,
        expires_at: input.expiresAt,
      })
      .select('*')
      .single<ProjectAccessSessionRow>();

    if (error || !data) {
      throw new InternalServerErrorException('Falha ao criar sessão de acesso ao projeto.');
    }

    return data;
  }

  async findActiveSessionById(projectAccessSessionId: string): Promise<ProjectAccessSessionRow | null> {
    const { data, error } = await this.supabase
      .from('project_access_sessions')
      .select('*')
      .eq('id', projectAccessSessionId)
      .eq('status', 'active')
      .maybeSingle<ProjectAccessSessionRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar sessão de acesso ao projeto.');
    }

    if (!data) {
      return null;
    }

    if (new Date(data.expires_at).getTime() <= Date.now()) {
      return null;
    }

    return data;
  }

  async touchSession(projectAccessSessionId: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.supabase
      .from('project_access_sessions')
      .update({
        last_seen_at: now,
      })
      .eq('id', projectAccessSessionId)
      .eq('status', 'active');

    if (error) {
      throw new InternalServerErrorException('Falha ao atualizar heartbeat do projeto.');
    }
  }

  async revokeSession(input: { projectAccessSessionId: string; reason: string }): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.supabase
      .from('project_access_sessions')
      .update({
        status: 'revoked',
        revoked_at: now,
        revoked_reason: input.reason,
        last_seen_at: now,
      })
      .eq('id', input.projectAccessSessionId)
      .eq('status', 'active');

    if (error) {
      throw new InternalServerErrorException('Falha ao revogar sessão de acesso ao projeto.');
    }
  }
}
