import { IsString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { RoomType } from '@prisma/client';

export class CreateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(RoomType)
  type: RoomType;

  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[];
}
