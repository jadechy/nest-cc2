import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'username',
  })
  @IsEmail()
  username: string;

  @ApiProperty({
    description: 'The color of the user',
    example: '#000000',
  })
  @IsEmail()
  color: string;
}