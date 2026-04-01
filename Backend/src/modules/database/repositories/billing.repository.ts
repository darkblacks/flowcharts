import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase.provider';

type PlanRow = {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  currency: string;
  is_active: boolean;
  marketing_features: unknown;
};

type PlanEntitlementRow = {
  id: string;
  plan_id: string;
  max_projects: number;
  activation_keys_per_cycle: number;
  max_viewers_per_project: number;
  max_moderators_per_project: number;
  max_automation_jobs: number;
  max_storage_mb: number;
  can_builder_edit: boolean;
  can_schedule_ingestion: boolean;
  created_at: string;
};

type UserSubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'pending' | 'active' | 'trialing' | 'past_due' | 'canceled';
  payment_provider: string | null;
  payment_reference: string | null;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  provider_subscription_id: string | null;
  provider_status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  entitlements_snapshot: Record<string, unknown>;
};

type CheckoutOrderRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'pending' | 'paid' | 'canceled';
  amount_cents: number;
  currency: string;
  provider: string | null;
  provider_reference: string | null;
  created_at: string;
  paid_at: string | null;
  subscription_id: string | null;
  provider_checkout_url: string | null;
};

type PaymentWebhookEventRow = {
  id: string;
  provider: string;
  event_type: string | null;
  external_id: string;
  signature_valid: boolean;
  payload: Record<string, unknown>;
  status: 'pending' | 'processed' | 'ignored' | 'failed';
  received_at: string;
  processed_at: string | null;
};

@Injectable()
export class BillingRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async findPlanBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('plans')
      .select('id, slug, name, price_cents, currency, is_active, marketing_features')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle<PlanRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar plano.');
    }

    return data;
  }

  async findEntitlementsByPlanId(planId: string) {
    const { data, error } = await this.supabase
      .from('plan_entitlements')
      .select('*')
      .eq('plan_id', planId)
      .maybeSingle<PlanEntitlementRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar entitlements do plano.');
    }

    return data;
  }

  async findActiveSubscriptionByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle<UserSubscriptionRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar assinatura ativa.');
    }

    return data;
  }

  async findAnySubscriptionByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle<UserSubscriptionRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar assinatura do usuário.');
    }

    return data;
  }

  async upsertPendingSubscription(input: {
    userId: string;
    planId: string;
    paymentProvider: string;
    providerSubscriptionId: string | null;
    providerStatus: string | null;
    entitlementsSnapshot: Record<string, unknown>;
  }) {
    const existing = await this.findAnySubscriptionByUserId(input.userId);

    if (existing) {
      const { data, error } = await this.supabase
        .from('user_subscriptions')
        .update({
          plan_id: input.planId,
          status: 'pending',
          payment_provider: input.paymentProvider,
          provider_subscription_id: input.providerSubscriptionId,
          provider_status: input.providerStatus,
          entitlements_snapshot: input.entitlementsSnapshot,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('*')
        .single<UserSubscriptionRow>();

      if (error || !data) {
        throw new InternalServerErrorException('Falha ao atualizar assinatura pendente.');
      }

      return data;
    }

    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .insert({
        user_id: input.userId,
        plan_id: input.planId,
        status: 'pending',
        payment_provider: input.paymentProvider,
        provider_subscription_id: input.providerSubscriptionId,
        provider_status: input.providerStatus,
        entitlements_snapshot: input.entitlementsSnapshot,
      })
      .select('*')
      .single<UserSubscriptionRow>();

    if (error || !data) {
      throw new InternalServerErrorException('Falha ao criar assinatura pendente.');
    }

    return data;
  }

  async activateSubscription(input: {
    userId: string;
    planId: string;
    paymentProvider: string;
    paymentReference: string;
    providerSubscriptionId: string | null;
    providerStatus: string | null;
    startedAt: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    expiresAt: string | null;
    entitlementsSnapshot: Record<string, unknown>;
  }) {
    const existing = await this.findAnySubscriptionByUserId(input.userId);

    const payload = {
      plan_id: input.planId,
      status: 'active',
      payment_provider: input.paymentProvider,
      payment_reference: input.paymentReference,
      provider_subscription_id: input.providerSubscriptionId,
      provider_status: input.providerStatus,
      started_at: input.startedAt,
      current_period_start: input.currentPeriodStart,
      current_period_end: input.currentPeriodEnd,
      expires_at: input.expiresAt,
      entitlements_snapshot: input.entitlementsSnapshot,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { data, error } = await this.supabase
        .from('user_subscriptions')
        .update(payload)
        .eq('id', existing.id)
        .select('*')
        .single<UserSubscriptionRow>();

      if (error || !data) {
        throw new InternalServerErrorException('Falha ao ativar assinatura.');
      }

      return data;
    }

    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .insert({
        user_id: input.userId,
        ...payload,
      })
      .select('*')
      .single<UserSubscriptionRow>();

    if (error || !data) {
      throw new InternalServerErrorException('Falha ao criar assinatura ativa.');
    }

    return data;
  }

  async createCheckoutOrder(input: {
    userId: string;
    planId: string;
    subscriptionId: string | null;
    amountCents: number;
    currency: string;
    provider: string;
  }) {
    const { data, error } = await this.supabase
      .from('checkout_orders')
      .insert({
        user_id: input.userId,
        plan_id: input.planId,
        subscription_id: input.subscriptionId,
        amount_cents: input.amountCents,
        currency: input.currency,
        provider: input.provider,
        status: 'pending',
      })
      .select('*')
      .single<CheckoutOrderRow>();

    if (error || !data) {
      throw new InternalServerErrorException('Falha ao criar checkout order.');
    }

    return data;
  }

  async attachCheckoutProviderData(input: {
    orderId: string;
    providerReference: string;
    checkoutUrl: string | null;
  }) {
    const { data, error } = await this.supabase
      .from('checkout_orders')
      .update({
        provider_reference: input.providerReference,
        provider_checkout_url: input.checkoutUrl,
      })
      .eq('id', input.orderId)
      .select('*')
      .single<CheckoutOrderRow>();

    if (error || !data) {
      throw new InternalServerErrorException(
        'Falha ao vincular dados do checkout order.',
      );
    }

    return data;
  }

  async findCheckoutOrderById(orderId: string) {
    const { data, error } = await this.supabase
      .from('checkout_orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle<CheckoutOrderRow>();

    if (error) {
      throw new InternalServerErrorException('Falha ao buscar checkout order.');
    }

    return data;
  }

  async markCheckoutOrderPaid(input: { orderId: string; subscriptionId: string | null }) {
    const { error } = await this.supabase
      .from('checkout_orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        subscription_id: input.subscriptionId,
      })
      .eq('id', input.orderId);

    if (error) {
      throw new InternalServerErrorException('Falha ao marcar order como paga.');
    }
  }

  async markCheckoutOrderCanceled(orderId: string) {
    const { error } = await this.supabase
      .from('checkout_orders')
      .update({
        status: 'canceled',
      })
      .eq('id', orderId);

    if (error) {
      throw new InternalServerErrorException('Falha ao cancelar checkout order.');
    }
  }

  async createWebhookEvent(input: {
    provider: string;
    eventType: string | null;
    externalId: string;
    signatureValid: boolean;
    payload: Record<string, unknown>;
  }) {
    const { data, error } = await this.supabase
      .from('payment_webhook_events')
      .insert({
        provider: input.provider,
        event_type: input.eventType,
        external_id: input.externalId,
        signature_valid: input.signatureValid,
        payload: input.payload,
        status: 'pending',
      })
      .select('*')
      .single<PaymentWebhookEventRow>();

    if (error || !data) {
      throw new InternalServerErrorException('Falha ao registrar webhook.');
    }

    return data;
  }

  async finishWebhookEvent(
    eventId: string,
    status: PaymentWebhookEventRow['status'],
  ) {
    const { error } = await this.supabase
      .from('payment_webhook_events')
      .update({
        status,
        processed_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (error) {
      throw new InternalServerErrorException('Falha ao finalizar webhook.');
    }
  }
}
