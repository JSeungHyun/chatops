import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}
