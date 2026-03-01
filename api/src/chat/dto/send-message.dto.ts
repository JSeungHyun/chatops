import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { MessageType } from '@prisma/client';

export class SendMessageDto {
  @IsString()
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}
