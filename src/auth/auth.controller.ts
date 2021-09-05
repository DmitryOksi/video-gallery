import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //TODO: logic to get accessToken by refreshToken
  //TODO: logic to logout user
  @Post('login')
  login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @Post('register')
  register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto);
  }
}
