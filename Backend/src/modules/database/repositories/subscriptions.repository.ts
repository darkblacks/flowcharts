import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase.provider';

type SubscriptionRow = {
  id: string;
  status: string;
  payment_provider: string | null;
  provider_subscription_id: string | null;
  provider_status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  started_at: string | null;
  expires_at: string | null;
  plans: {
    id: string;
    slug: string;
    name: string;
    price_cents: number;
    currency: string;
    is_active: boolean;
    marketing_features: unknown;
  } | null;
};

@Injectable()
export class SubscriptionsRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async findActiveByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select(
        `
          id,
          status,
          payment_provider,
          provider_subscription_id,
          provider_status,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          started_at,
          expires_at,
          plans (
            id,
            slug,
            name,
            price_cents,
            currency,
            is_active,
            marketing_features
          )
        `,
      )
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<SubscriptionRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar assinatura do usuário.');
    }

    return data;
  }
}
