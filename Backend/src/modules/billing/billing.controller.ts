import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppSessionGuard } from '../../common/guards/app-session.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentAppUser } from '../../common/interfaces/request-context.interface';
import { BillingService } from './billing.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('billing')
@UseGuards(AppSessionGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('me')
  async me(@CurrentUser() appUser: CurrentAppUser) {
    return this.billingService.me(appUser);
  }

  @Post('subscribe')
  async subscribe(
    @CurrentUser() appUser: CurrentAppUser,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.billingService.subscribe(appUser, dto);
  }
}
