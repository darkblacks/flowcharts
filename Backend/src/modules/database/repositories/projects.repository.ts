import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';
import { SUPABASE_CLIENT } from '../supabase.provider';

type ProjectRow = {
  id: string;
  owner_user_id: string;
  subscription_id: string | null;
  activated_by_key_id: string | null;
  name: string;
  slug: string;
  status: 'active' | 'archived' | 'setup_pending' | 'setup_failed';
  setup_status: 'pending' | 'ready' | 'failed';
  storage_root_id: string | null;
  published_release_id: string | null;
  created_at: string;
  updated_at: string;
};

type ProjectStorageRootRow = {
  id: string;
  project_id: string;
  provider: 'cloudflare_r2';
  bucket: string;
  prefix: string;
  manifest_key: string | null;
  bootstrap_status: 'pending' | 'ready' | 'failed';
  created_at: string;
};

type ProjectReleaseRow = {
  id: string;
  project_id: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  manifest_key: string;
  created_by_user_id: string | null;
  published_at: string | null;
  created_at: string;
};

@Injectable()
export class ProjectsRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async countActiveByOwnerUserId(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('owner_user_id', userId)
      .neq('status', 'archived');

    if (error) {
      throw new InternalServerErrorException('Falha ao contar projetos do usuário.');
    }

    return count ?? 0;
  }

  async createProjectSkeleton(input: {
    ownerUserId: string;
    subscriptionId: string;
    activationKeyId: string;
    name: string;
    cloudflareBucket: string;
  }) {
    const slug = await this.createUniqueSlug(input.name);
    const projectCode = this.generateProjectCode();
    const projectPrefix = `projects/${slug}`;
    const manifestKey = `${projectPrefix}/releases/v1/manifest.json`;

    const { data: project, error: projectError } = await this.supabase
      .from('projects')
      .insert({
        owner_user_id: input.ownerUserId,
        subscription_id: input.subscriptionId,
        activated_by_key_id: input.activationKeyId,
        name: input.name,
        slug,
        status: 'setup_pending',
        setup_status: 'pending',
      })
      .select('*')
      .single<ProjectRow>();

    if (projectError || !project) {
      throw new InternalServerErrorException('Falha ao criar projeto base.');
    }

    const { error: memberError } = await this.supabase.from('project_members').insert({
      project_id: project.id,
      user_id: input.ownerUserId,
      role: 'author',
      status: 'active',
      invited_by_user_id: input.ownerUserId,
      joined_at: new Date().toISOString(),
    });

    if (memberError) {
      throw new InternalServerErrorException('Falha ao criar membership author do projeto.');
    }

    const codeHash = createHash('sha256').update(projectCode).digest('hex');
    const codeHint = projectCode.slice(-4);

    const { error: secretError } = await this.supabase.from('project_access_secrets').insert({
      project_id: project.id,
      status: 'active',
      code_hash: codeHash,
      code_hint: codeHint,
      version: 1,
      created_by_user_id: input.ownerUserId,
    });

    if (secretError) {
      throw new InternalServerErrorException('Falha ao criar segredo inicial do projeto.');
    }

    const moderatorPermissions = {
      'page.view': true,
      'dashboard.view': true,
      'layout.edit': false,
      'widget.add': false,
      'widget.remove': false,
      'dataset.add': false,
      'dataset.refresh': false,
      'schema.edit': false,
      'member.invite': false,
      'release.publish': false,
    };

    const viewerPermissions = {
      'page.view': true,
      'dashboard.view': true,
      'layout.edit': false,
      'widget.add': false,
      'widget.remove': false,
      'dataset.add': false,
      'dataset.refresh': false,
      'schema.edit': false,
      'member.invite': false,
      'release.publish': false,
    };

    const { error: modPolicyError } = await this.supabase.from('project_role_policies').insert({
      project_id: project.id,
      role: 'moderator',
      permissions: moderatorPermissions,
      updated_by_user_id: input.ownerUserId,
    });

    if (modPolicyError) {
      throw new InternalServerErrorException('Falha ao criar policy de moderator.');
    }

    const { error: viewerPolicyError } = await this.supabase.from('project_role_policies').insert({
      project_id: project.id,
      role: 'viewer',
      permissions: viewerPermissions,
      updated_by_user_id: input.ownerUserId,
    });

    if (viewerPolicyError) {
      throw new InternalServerErrorException('Falha ao criar policy de viewer.');
    }

    const { data: storageRoot, error: storageRootError } = await this.supabase
      .from('project_storage_roots')
      .insert({
        project_id: project.id,
        provider: 'cloudflare_r2',
        bucket: input.cloudflareBucket,
        prefix: projectPrefix,
        manifest_key: manifestKey,
        bootstrap_status: 'pending',
      })
      .select('*')
      .single<ProjectStorageRootRow>();

    if (storageRootError || !storageRoot) {
      throw new InternalServerErrorException('Falha ao criar storage root do projeto.');
    }

    const { error: storageProjectError } = await this.supabase
      .from('projects')
      .update({ storage_root_id: storageRoot.id })
      .eq('id', project.id);

    if (storageProjectError) {
      throw new InternalServerErrorException('Falha ao vincular storage root ao projeto.');
    }

    const { data: release, error: releaseError } = await this.supabase
      .from('project_releases')
      .insert({
        project_id: project.id,
        version: 1,
        status: 'draft',
        manifest_key: manifestKey,
        created_by_user_id: input.ownerUserId,
      })
      .select('*')
      .single<ProjectReleaseRow>();

    if (releaseError || !release) {
      throw new InternalServerErrorException('Falha ao criar release inicial do projeto.');
    }

    return {
      project,
      storageRoot,
      release,
      projectCode,
    };
  }

  async markSetupReady(input: { projectId: string; storageRootId: string }): Promise<void> {
    const { error: storageError } = await this.supabase
      .from('project_storage_roots')
      .update({ bootstrap_status: 'ready' })
      .eq('id', input.storageRootId);

    if (storageError) {
      throw new InternalServerErrorException('Falha ao marcar storage root como ready.');
    }

    const { error: projectError } = await this.supabase
      .from('projects')
      .update({
        status: 'active',
        setup_status: 'ready',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.projectId);

    if (projectError) {
      throw new InternalServerErrorException('Falha ao concluir setup do projeto.');
    }
  }

  async markSetupFailed(input: {
    projectId: string;
    storageRootId?: string;
    errorMessage?: string;
  }): Promise<void> {
    if (input.storageRootId) {
      const { error: storageError } = await this.supabase
        .from('project_storage_roots')
        .update({ bootstrap_status: 'failed' })
        .eq('id', input.storageRootId);

      if (storageError) {
        throw new InternalServerErrorException('Falha ao marcar storage root como failed.');
      }
    }

    const { error } = await this.supabase
      .from('projects')
      .update({
        status: 'setup_failed',
        setup_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.projectId);

    if (error) {
      throw new InternalServerErrorException(
        input.errorMessage || 'Falha ao marcar projeto como setup_failed.',
      );
    }
  }

  async findProjectBootstrapContextForOwner(input: {
    projectId: string;
    ownerUserId: string;
  }): Promise<{
    project: ProjectRow;
    storageRoot: ProjectStorageRootRow;
  } | null> {
    const { data: project, error: projectError } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', input.projectId)
      .eq('owner_user_id', input.ownerUserId)
      .maybeSingle<ProjectRow>();

    if (projectError) {
      throw new InternalServerErrorException('Falha ao buscar projeto.');
    }

    if (!project) {
      return null;
    }

    const { data: storageRoot, error: storageRootError } = await this.supabase
      .from('project_storage_roots')
      .select('*')
      .eq('project_id', project.id)
      .maybeSingle<ProjectStorageRootRow>();

    if (storageRootError) {
      throw new InternalServerErrorException('Falha ao buscar storage root do projeto.');
    }

    if (!storageRoot) {
      throw new InternalServerErrorException('Projeto sem storage root configurado.');
    }

    return {
      project,
      storageRoot,
    };
  }

  slugify(name: string): string {
    const base = name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);

    return base || `project-${randomBytes(3).toString('hex')}`;
  }

  private async createUniqueSlug(name: string): Promise<string> {
    const base = this.slugify(name);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = attempt === 0 ? base : `${base}-${randomBytes(2).toString('hex')}`;

      const { data, error } = await this.supabase
        .from('projects')
        .select('id')
        .eq('slug', candidate)
        .maybeSingle();

      if (error) {
        throw new InternalServerErrorException('Falha ao verificar slug do projeto.');
      }

      if (!data) {
        return candidate;
      }
    }

    throw new InternalServerErrorException('Não foi possível gerar um slug único para o projeto.');
  }

  private generateProjectCode(): string {
    return `PRJ-${randomBytes(4).toString('hex').toUpperCase()}`;
  }
}
