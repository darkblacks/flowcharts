import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase.provider';

@Injectable()
export class ProvisioningRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async createRun(projectId: string) {
    const { data, error } = await this.supabase
      .from('project_provisioning_runs')
      .insert({
        project_id: projectId,
        status: 'running',
        step: 'db.project_created',
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new InternalServerErrorException('Falha ao criar provisioning run.');
    }

    return data;
  }

  async markStep(runId: string, input: { step: string; details?: Record<string, unknown> }) {
    const { error } = await this.supabase
      .from('project_provisioning_runs')
      .update({
        step: input.step,
        details: input.details ?? {},
      })
      .eq('id', runId);

    if (error) {
      throw new InternalServerErrorException('Falha ao atualizar etapa do provisioning run.');
    }
  }

  async markSuccess(runId: string, details: Record<string, unknown>) {
    const { error } = await this.supabase
      .from('project_provisioning_runs')
      .update({
        status: 'success',
        finished_at: new Date().toISOString(),
        step: 'completed',
        details,
      })
      .eq('id', runId);

    if (error) {
      throw new InternalServerErrorException('Falha ao concluir provisioning run.');
    }
  }

  async markFailure(
    runId: string,
    input: {
      step: string;
      errorCode: string;
      errorMessage: string;
      details?: Record<string, unknown>;
    },
  ) {
    const { error } = await this.supabase
      .from('project_provisioning_runs')
      .update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        step: input.step,
        error_code: input.errorCode,
        error_message: input.errorMessage,
        details: input.details ?? {},
      })
      .eq('id', runId);

    if (error) {
      throw new InternalServerErrorException('Falha ao marcar provisioning run como failed.');
    }
  }
}
