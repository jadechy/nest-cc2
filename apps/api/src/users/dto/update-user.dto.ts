import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'username',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    description: 'The color of the user',
    example: '#000000',
  })
  @IsString()
  color!: string;
}