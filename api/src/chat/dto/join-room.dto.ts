import { IsUUID } from 'class-validator';

export class JoinRoomDto {
  @IsUUID()
  roomId: string;
}
