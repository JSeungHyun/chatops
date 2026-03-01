import { IsString, IsOptional } from 'class-validator';

export class UploadFileDto {
  @IsString()
  filename: string;

  @IsOptional()
  @IsString()
  mimetype?: string;
}
