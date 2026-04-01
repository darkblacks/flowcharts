import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class SetAdminEnrollmentDto {
  @ValidateIf((o) => !o.email)
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ValidateIf((o) => !o.userId)
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @IsOptional()
  scopes?: string[];
}
