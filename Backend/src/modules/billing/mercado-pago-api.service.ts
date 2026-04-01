import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type MercadoPagoPreferenceResponse = {
  id: string;
  init_point?: string | null;
  sandbox_init_point?: string | null;
};

type MercadoPagoPaymentResponse = {
  id: number | string;
  status?: string | null;
  status_detail?: string | null;
  external_reference?: string | null;
  date_approved?: string | null;
  date_created?: string | null;
};

@Injectable()
export class MercadoPagoApiService {
  constructor(private readonly configService: ConfigService) {}

  async createCheckoutPreference(input: {
    externalReference: string;
    title: string;
    amountCents: number;
    payerEmail?: string | null;
  }) {
    const baseUrl = this.configService.getOrThrow<string>('mercadoPago.baseUrl');
    const accessToken = this.configService.getOrThrow<string>('mercadoPago.accessToken');
    const notificationUrl = this.configService.get<string>('mercadoPago.notificationUrl');

    const response = await fetch(`${baseUrl}/checkout/preferences`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_reference: input.externalReference,
        notification_url: notificationUrl ?? undefined,
        items: [
          {
            title: input.title,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: Number((input.amountCents / 100).toFixed(2)),
          },
        ],
        payer: input.payerEmail ? { email: input.payerEmail } : undefined,
        back_urls: undefined,
        auto_return: 'approved',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new InternalServerErrorException(
        `Falha ao criar checkout no Mercado Pago. ${errorBody}`,
      );
    }

    const data = (await response.json()) as MercadoPagoPreferenceResponse;

    if (!data?.id || (!data.init_point && !data.sandbox_init_point)) {
      throw new InternalServerErrorException(
        'Mercado Pago não retornou uma URL de checkout válida.',
      );
    }

    return {
      preferenceId: data.id,
      checkoutUrl: data.init_point ?? data.sandbox_init_point ?? null,
    };
  }

  async findPaymentById(paymentId: string) {
    const baseUrl = this.configService.getOrThrow<string>('mercadoPago.baseUrl');
    const accessToken = this.configService.getOrThrow<string>('mercadoPago.accessToken');

    const response = await fetch(`${baseUrl}/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new InternalServerErrorException(
        `Falha ao consultar pagamento no Mercado Pago. ${errorBody}`,
      );
    }

    const data = (await response.json()) as MercadoPagoPaymentResponse;

    return {
      id: String(data.id),
      status: data.status ?? null,
      statusDetail: data.status_detail ?? null,
      externalReference: data.external_reference ?? null,
      approvedAt: data.date_approved ?? null,
      createdAt: data.date_created ?? null,
      raw: data,
    };
  }

  /**
   * Validação propositalmente simples para não quebrar o fluxo atual.
   * Se houver segredo configurado, exigimos ao menos a presença do header.
   * A validação criptográfica completa pode entrar depois sem alterar o contrato.
   */
  computeSignatureValidity(headers: Record<string, string | string[] | undefined>) {
    const webhookSecret = this.configService.get<string>('mercadoPago.webhookSecret');
    if (!webhookSecret) return true;

    const signature = headers['x-signature'];
    if (typeof signature === 'string' && signature.trim().length > 0) return true;
    if (Array.isArray(signature) && signature.some((value) => value.trim().length > 0)) {
      return true;
    }

    return false;
  }
}
