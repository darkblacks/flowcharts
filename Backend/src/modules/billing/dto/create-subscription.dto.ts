import { IsString, Matches } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/i, {
    message: 'planSlug deve conter apenas letras, números e hífens.',
  })
  planSlug!: string;
}
