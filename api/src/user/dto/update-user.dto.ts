import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
