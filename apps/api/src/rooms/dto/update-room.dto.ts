import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateRoomDto {
  @ApiProperty({
    description: 'The name of the room',
    example: 'name',
  })
  @IsString()
  name: string;
}