import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoom(userId: string, dto: CreateRoomDto) {
    const room = await this.prisma.chatRoom.create({
      data: {
        name: dto.name,
        type: dto.type,
        members: {
          create: [
            { userId },
            ...dto.memberIds.map((memberId) => ({ userId: memberId })),
          ],
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, email: true, nickname: true, avatar: true } } },
        },
      },
    });

    return room;
  }

  async getRoomsByUserId(userId: string) {
    return this.prisma.chatRoom.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, email: true, nickname: true, avatar: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getRoomById(id: string, userId: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, email: true, nickname: true, avatar: true } } },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    if (!room.members.some((m) => m.userId === userId)) {
      throw new ForbiddenException('You are not a member of this chat room');
    }

    return room;
  }

  async sendMessage(userId: string, roomId: string, dto: SendMessageDto) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        type: dto.type,
        fileUrl: dto.fileUrl,
        userId,
        roomId,
      },
      include: {
        user: { select: { id: true, email: true, nickname: true, avatar: true } },
      },
    });

    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getMessages(roomId: string, userId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { members: true },
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    if (!room.members.some((m) => m.userId === userId)) {
      throw new ForbiddenException('You are not a member of this chat room');
    }

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { roomId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, nickname: true, avatar: true } },
        },
      }),
      this.prisma.message.count({ where: { roomId } }),
    ]);

    return {
      data: messages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
