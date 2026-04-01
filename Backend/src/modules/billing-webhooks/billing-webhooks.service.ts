import { Injectable, Logger } from '@nestjs/common';
import { ActivationKeysRepository } from '../database/repositories/activation-keys.repository';
import { BillingRepository } from '../database/repositories/billing.repository';
import { MercadoPagoApiService } from '../billing/mercado-pago-api.service';

@Injectable()
export class BillingWebhooksService {
  private readonly logger = new Logger(BillingWebhooksService.name);

  constructor(
    private readonly billingRepository: BillingRepository,
    private readonly activationKeysRepository: ActivationKeysRepository,
    private readonly mercadoPagoApiService: MercadoPagoApiService,
  ) {}

  async handleMercadoPago(
    headers: Record<string, string | string[] | undefined>,
    payload: Record<string, unknown>,
  ) {
    const externalId = this.extractExternalId(payload);
    const eventType = this.extractEventType(payload);
    const signatureValid = this.mercadoPagoApiService.computeSignatureValidity(headers);

    const event = await this.billingRepository.createWebhookEvent({
      provider: 'mercado_pago',
      eventType,
      externalId: externalId ?? 'unknown',
      signatureValid,
      payload,
    });

    if (!externalId) {
      await this.billingRepository.finishWebhookEvent(event.id, 'ignored');
      return { ok: true, ignored: true };
    }

    if (eventType !== 'payment') {
      await this.billingRepository.finishWebhookEvent(event.id, 'ignored');
      return { ok: true, ignored: true };
    }

    try {
      const payment = await this.mercadoPagoApiService.findPaymentById(externalId);

      if (!payment.externalReference) {
        await this.billingRepository.finishWebhookEvent(event.id, 'ignored');
        return { ok: true, ignored: true };
      }

      const order = await this.billingRepository.findCheckoutOrderById(payment.externalReference);

      if (!order) {
        this.logger.warn(
          `Webhook Mercado Pago recebido para order inexistente: ${payment.externalReference}`,
        );
        await this.billingRepository.finishWebhookEvent(event.id, 'ignored');
        return { ok: true, ignored: true };
      }

      if (payment.status !== 'approved') {
        const nextStatus = payment.status === 'cancelled' ? 'canceled' : order.status;
        if (nextStatus === 'canceled') {
          await this.billingRepository.markCheckoutOrderCanceled(order.id);
        }
        await this.billingRepository.finishWebhookEvent(event.id, 'processed');
        return { ok: true, processed: true, status: payment.status };
      }

      if (order.status === 'paid') {
        await this.billingRepository.finishWebhookEvent(event.id, 'processed');
        return { ok: true, processed: true, duplicated: true };
      }

      const entitlements = await this.billingRepository.findEntitlementsByPlanId(order.plan_id);

      const subscription = await this.billingRepository.activateSubscription({
        userId: order.user_id,
        planId: order.plan_id,
        paymentProvider: 'mercado_pago',
        paymentReference: payment.id,
        providerSubscriptionId: payment.id,
        providerStatus: payment.status ?? 'approved',
        startedAt: payment.approvedAt ?? new Date().toISOString(),
        currentPeriodStart: payment.approvedAt ?? new Date().toISOString(),
        currentPeriodEnd: null,
        expiresAt: null,
        entitlementsSnapshot: entitlements ?? {},
      });

      await this.billingRepository.markCheckoutOrderPaid({
        orderId: order.id,
        subscriptionId: subscription.id,
      });

      const quantity = Math.max(
        1,
        Number(entitlements?.activation_keys_per_cycle ?? 1),
      );

      await this.activationKeysRepository.ensureAvailableKeys({
        userId: order.user_id,
        subscriptionId: subscription.id,
        quantity,
      });

      await this.billingRepository.finishWebhookEvent(event.id, 'processed');

      return { ok: true, processed: true };
    } catch (error) {
      await this.billingRepository.finishWebhookEvent(event.id, 'failed');
      throw error;
    }
  }

  private extractExternalId(payload: Record<string, unknown>) {
    const bodyId = payload.id;
    if (typeof bodyId === 'string' || typeof bodyId === 'number') {
      return String(bodyId);
    }

    const data = payload.data;
    if (data && typeof data === 'object' && 'id' in data) {
      const nestedId = (data as { id?: unknown }).id;
      if (typeof nestedId === 'string' || typeof nestedId === 'number') {
        return String(nestedId);
      }
    }

    return null;
  }

  private extractEventType(payload: Record<string, unknown>) {
    const type = payload.type;
    if (typeof type === 'string' && type.length > 0) return type;

    const action = payload.action;
    if (typeof action === 'string' && action.startsWith('payment')) return 'payment';

    return null;
  }
}
