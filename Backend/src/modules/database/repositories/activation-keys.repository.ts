import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
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

  async countAvailableBySubscriptionId(subscriptionId: string) {
    const { count, error } = await this.supabase
      .from('activation_keys')
      .select('id', { count: 'exact', head: true })
      .eq('subscription_id', subscriptionId)
      .eq('status', 'available');

    if (error) {
      throw new InternalServerErrorException('Falha ao contar activation keys disponíveis.');
    }

    return count ?? 0;
  }


  async findAvailableByCodeForUser(input: { code: string; userId: string }) {
    return this.findAvailableByCodeAndUserId(input);
  }

  async findAvailableByCodeAndUserId(input: { code: string; userId: string }) {
    const { data, error } = await this.supabase
      .from('activation_keys')
      .select('*')
      .eq('code', input.code.trim().toUpperCase())
      .eq('user_id', input.userId)
      .eq('status', 'available')
      .maybeSingle<ActivationKeyRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar activation key.');
    }

    return data;
  }

  async ensureAvailableKeys(input: {
    userId: string;
    subscriptionId: string;
    quantity: number;
    expiresAt?: string | null;
  }) {
    const available = await this.countAvailableBySubscriptionId(input.subscriptionId);
    const missing = Math.max(0, input.quantity - available);

    if (missing === 0) {
      return;
    }

    const keys = Array.from({ length: missing }, () => ({
      user_id: input.userId,
      subscription_id: input.subscriptionId,
      code: this.generateCode(),
      status: 'available',
      expires_at: input.expiresAt ?? null,
    }));

    const { error } = await this.supabase.from('activation_keys').insert(keys);

    if (error) {
      throw new InternalServerErrorException('Falha ao gerar activation keys.');
    }
  }

  async redeem(input: { activationKeyId: string; projectId: string }) {
    const now = new Date().toISOString();

    const { error } = await this.supabase
      .from('activation_keys')
      .update({
        status: 'redeemed',
        redeemed_project_id: input.projectId,
        redeemed_at: now,
      })
      .eq('id', input.activationKeyId)
      .eq('status', 'available');

    if (error) {
      throw new InternalServerErrorException('Falha ao resgatar activation key.');
    }
  }

  private generateCode() {
    return `FC-${randomBytes(4).toString('hex').toUpperCase()}`;
  }
}
