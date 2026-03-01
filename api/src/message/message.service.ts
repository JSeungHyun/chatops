import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageQueryDto } from './dto/message-query.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async findByRoomId(roomId: string, query: MessageQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, email: true, nickname: true, avatar: true } },
      },
    });
  }
}
