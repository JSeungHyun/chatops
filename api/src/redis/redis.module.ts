import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

// TODO: Implement Redis connection (Stage 3)
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
