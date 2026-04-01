import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ActivateProjectDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @IsString()
  @Matches(/^[A-Z0-9-]+$/)
  activationKey!: string;
}
