import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelectWithoutPassword = {
    id: true,
    email: true,
    nickname: true,
    avatar: true,
    createdAt: true,
    updatedAt: true,
  };

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  async searchByNickname(nickname: string) {
    return this.prisma.user.findMany({
      where: {
        nickname: { contains: nickname, mode: 'insensitive' },
      },
      select: this.userSelectWithoutPassword,
      take: 20,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.nickname) {
      const existing = await this.prisma.user.findUnique({
        where: { nickname: dto.nickname },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Nickname already exists');
      }
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: dto,
      });

      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Nickname already exists');
      }
      throw error;
    }
  }
}
