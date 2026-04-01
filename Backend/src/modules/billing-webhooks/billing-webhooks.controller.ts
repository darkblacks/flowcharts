import { Body, Controller, Headers, Post } from '@nestjs/common';
import { BillingWebhooksService } from './billing-webhooks.service';

@Controller('webhooks')
export class BillingWebhooksController {
  constructor(private readonly billingWebhooksService: BillingWebhooksService) {}

  @Post('mercadopago')
  async mercadoPago(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.billingWebhooksService.handleMercadoPago(headers, body);
  }
}
