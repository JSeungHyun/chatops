import { IsString, MinLength, MaxLength } from 'class-validator';

export class CheckNicknameDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname: string;
}
