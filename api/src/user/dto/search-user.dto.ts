import { IsString, MinLength, MaxLength } from 'class-validator';

export class SearchUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname: string;
}
