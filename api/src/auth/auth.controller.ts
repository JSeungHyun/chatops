import { Controller, Post, Get, Query, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CheckNicknameDto } from './dto/check-nickname.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Get('check-nickname')
  async checkNickname(@Query() dto: CheckNicknameDto) {
    return this.authService.checkNicknameAvailable(dto.nickname);
  }
}
