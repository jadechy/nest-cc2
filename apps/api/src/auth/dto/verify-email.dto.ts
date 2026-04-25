import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Token JWT de vérification reçu par mail',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsJWT()
  token!: string;
}