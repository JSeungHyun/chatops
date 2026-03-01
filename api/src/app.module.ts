import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { FileModule } from './file/file.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '../.env.dev' : undefined,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ChatModule,
    MessageModule,
    RedisModule,
    QueueModule,
    FileModule,
    MetricsModule,
  ],
})
export class AppModule {}
