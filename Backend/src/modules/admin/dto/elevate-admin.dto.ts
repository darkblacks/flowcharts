import { IsString, MinLength } from 'class-validator';

export class ElevateAdminDto {
  @IsString()
  @MinLength(20)
  firebaseIdToken!: string;
}
