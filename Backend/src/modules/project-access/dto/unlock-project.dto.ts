import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UnlockProjectDto {
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  projectSlug?: string;

  @IsString()
  @MinLength(3)
  code!: string;
}
