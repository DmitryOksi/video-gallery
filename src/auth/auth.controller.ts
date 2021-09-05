import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //TODO: depricate to make request not registered users
  @HttpCode(200)
  @Post('login')
  async login(@Body() authDto: AuthDto) {
    return await this.authService.login(authDto);
  }

  @HttpCode(200)
  @Post('register')
  async register(@Body() authDto: AuthDto) {
    return await this.authService.register(authDto);
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Body('email') email: string): Promise<string> {
    return await this.authService.logout(email);
  }

  @HttpCode(200)
  @Post('access-token')
  async getAccessTokenByRefreshToken(
    @Body('email') email: string,
    @Body('currentRefreshToken') currentRefreshToken: string,
  ): Promise<string> {
    return await this.authService.getAccessTokenByRefreshToken(
      email,
      currentRefreshToken,
    );
  }
}
