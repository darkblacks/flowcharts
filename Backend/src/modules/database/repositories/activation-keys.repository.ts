import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { SUPABASE_CLIENT } from '../supabase.provider';

type ActivationKeyRow = {
  id: string;
  user_id: string;
  subscription_id: string;
  code: string;
  status: 'available' | 'redeemed' | 'expired' | 'revoked';
  redeemed_project_id: string | null;
  issued_at: string;
  redeemed_at: string | null;
  expires_at: string | null;
};

@Injectable()
export class ActivationKeysRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  generateCode(prefix = 'FC'): string {
    const random = randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}-${random}`;
  }

  async ensureKeysForSubscription(input: {
    userId: string;
    subscriptionId: string;
    quantity: number;
  }): Promise<void> {
    const { data: existing, error: existingError } = await this.supabase
      .from('activation_keys')
      .select('id')
      .eq('subscription_id', input.subscriptionId)
      .in('status', ['available', 'redeemed']);

    if (existingError) {
      throw new InternalServerErrorException('Falha ao verificar activation keys.');
    }

    const existingCount = existing?.length ?? 0;
    const missing = Math.max(0, input.quantity - existingCount);
    if (missing === 0) return;

    const rows = Array.from({ length: missing }).map(() => ({
      user_id: input.userId,
      subscription_id: input.subscriptionId,
      code: this.generateCode(),
      status: 'available',
    }));

    const { error } = await this.supabase.from('activation_keys').insert(rows);
    if (error) {
      throw new InternalServerErrorException('Falha ao criar activation keys.');
    }
  }

  async findAvailableByCodeForUser(input: { userId: string; code: string }) {
    const { data, error } = await this.supabase
      .from('activation_keys')
      .select('*')
      .eq('user_id', input.userId)
      .eq('code', input.code)
      .eq('status', 'available')
      .maybeSingle<ActivationKeyRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar activation key.');
    }

    if (!data) return null;

    if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) {
      return null;
    }

    return data;
  }

  async redeem(input: { activationKeyId: string; projectId: string }): Promise<void> {
    const { error } = await this.supabase
      .from('activation_keys')
      .update({
        status: 'redeemed',
        redeemed_project_id: input.projectId,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', input.activationKeyId)
      .eq('status', 'available');

    if (error) {
      throw new InternalServerErrorException('Falha ao resgatar activation key.');
    }
  }

  async listAvailableByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('activation_keys')
      .select('id, code, status, issued_at, expires_at')
      .eq('user_id', userId)
      .eq('status', 'available')
      .order('issued_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException('Falha ao listar activation keys.');
    }

    return data ?? [];
  }
}
