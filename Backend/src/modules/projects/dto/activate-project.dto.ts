import { IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class ActivateProjectDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @IsString()
  @Matches(/^[A-Z0-9-]+$/i, {
    message: 'activationKey deve conter apenas letras, números e hífens.',
  })
  activationKey!: string;
}
