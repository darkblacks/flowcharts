import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CurrentAppUser } from '../../common/interfaces/request-context.interface';
import { ActivationKeysRepository } from '../database/repositories/activation-keys.repository';
import { BillingRepository } from '../database/repositories/billing.repository';
import { MercadoPagoApiService } from './mercado-pago-api.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class BillingService {
  constructor(
    private readonly billingRepository: BillingRepository,
    private readonly activationKeysRepository: ActivationKeysRepository,
    private readonly mercadoPagoApiService: MercadoPagoApiService,
  ) {}

  async me(appUser: CurrentAppUser) {
    const subscription = await this.billingRepository.findActiveSubscriptionByUserId(appUser.id);

    if (!subscription) {
      return {
        subscription: null,
        entitlements: null,
        availableActivationKeys: 0,
      };
    }

    const availableActivationKeys =
      await this.activationKeysRepository.countAvailableBySubscriptionId(subscription.id);

    return {
      subscription,
      entitlements: subscription.entitlements_snapshot ?? null,
      availableActivationKeys,
    };
  }

  async subscribe(appUser: CurrentAppUser, dto: CreateSubscriptionDto) {
    const plan = await this.billingRepository.findPlanBySlug(dto.planSlug);

    if (!plan) {
      throw new NotFoundException('Plano não encontrado ou inativo.');
    }

    const entitlements = await this.billingRepository.findEntitlementsByPlanId(plan.id);

    if (!entitlements) {
      throw new BadRequestException('Plano sem configuração de entitlements.');
    }

    const subscription = await this.billingRepository.upsertPendingSubscription({
      userId: appUser.id,
      planId: plan.id,
      paymentProvider: 'mercado_pago',
      providerSubscriptionId: null,
      providerStatus: 'pending',
      entitlementsSnapshot: entitlements,
    });

    const order = await this.billingRepository.createCheckoutOrder({
      userId: appUser.id,
      planId: plan.id,
      subscriptionId: subscription.id,
      amountCents: plan.price_cents,
      currency: plan.currency,
      provider: 'mercado_pago',
    });

    const checkout = await this.mercadoPagoApiService.createCheckoutPreference({
      externalReference: order.id,
      title: plan.name,
      amountCents: plan.price_cents,
      payerEmail: appUser.email,
    });

    const updatedOrder = await this.billingRepository.attachCheckoutProviderData({
      orderId: order.id,
      providerReference: checkout.preferenceId,
      checkoutUrl: checkout.checkoutUrl,
    });

    return {
      order: updatedOrder,
      subscription,
      plan,
      checkoutUrl: updatedOrder.provider_checkout_url,
    };
  }
}
