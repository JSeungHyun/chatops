import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createRoom(@CurrentUser() user: { id: string }, @Body() dto: CreateRoomDto) {
    return this.chatService.createRoom(user.id, dto);
  }

  @Get()
  async getRooms(@CurrentUser() user: { id: string }) {
    return this.chatService.getRoomsByUserId(user.id);
  }

  @Get(':id')
  async getRoom(@Param('id') id: string) {
    return this.chatService.getRoomById(id);
  }

  @Post(':id/messages')
  async sendMessage(
    @CurrentUser() user: { id: string },
    @Param('id') roomId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user.id, roomId, dto);
  }

  @Get(':id/messages')
  async getMessages(@Param('id') roomId: string, @Query() pagination: PaginationDto) {
    return this.chatService.getMessages(roomId, pagination);
  }
}
