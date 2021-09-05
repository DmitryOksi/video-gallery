import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //TODO: depricate to make request not registered users
  @HttpCode(200)
  @Post('login')
  async login(@Req() req: Request) {
    const authDto: AuthDto = req.body;
    const { refreshTokenCookie, accessTokenCookie, user } =
      await this.authService.login(authDto);
    req.res.setHeader('Set-Cookie', [refreshTokenCookie, accessTokenCookie]);
    return user;
  }

  @HttpCode(200)
  @Post('register')
  async register(@Req() req: Request) {
    const authDto: AuthDto = req.body;
    const { user, refreshTokenCookie, accessTokenCookie } =
      await this.authService.register(authDto);
    req.res.setHeader('Set-Cookie', [refreshTokenCookie, accessTokenCookie]);
    return user;
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Req() req: Request) {
    const {
      body: { email },
    } = req;
    req.res.setHeader('Set-Cookie', await this.authService.logout(email));
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
