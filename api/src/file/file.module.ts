import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';

// TODO: Implement MinIO integration (Stage 6)
@Module({
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
