import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'The name of the room',
    example: 'General',
  })
  @IsString()
  name!: string;
}