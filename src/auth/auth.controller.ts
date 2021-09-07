import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Request } from 'express';
import { User } from 'src/user/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @HttpCode(200)
  @Post('login')
  async login(@Req() req: Request): Promise<User> {
    const authDto: AuthDto = req.body;
    const { email, password } = authDto;
    if (!email || !password) {
      throw new BadRequestException('Email and password required!');
    }
    const { accessTokenCookie, refreshTokenCookie, user } =
      await this.authService.login(authDto);
    req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    return user;
  }

  @HttpCode(200)
  @Post('register')
  async register(@Req() req: Request): Promise<User> {
    const authDto: AuthDto = req.body;
    const { email, password } = authDto;
    if (!email || !password) {
      throw new BadRequestException('Email and password required!');
    }
    const { accessTokenCookie, refreshTokenCookie, user } =
      await this.authService.register(authDto);
    req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    return user;
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Req() req: Request & { user: IAccessTokenPayload }) {
    const {
      user: { email },
    } = req;
    const cookiesForLogOut: string[] = await this.authService.logout(email);
    req.res.setHeader('Set-Cookie', cookiesForLogOut);
  }

  @HttpCode(200)
  @Get('access-token/:email')
  async getAccessTokenByRefreshToken(
    @Req() req: Request & { user: IAccessTokenPayload },
  ) {
    const {
      params: { email },
    } = req;
    const currentRefreshToken = req.cookies['Refresh'];
    if (!currentRefreshToken) {
      throw new UnauthorizedException(
        'Cookies does not include refresh token. Please login.',
      );
    }
    const accessTokenCookie =
      await this.authService.getAccessTokenCookieByRefreshToken(
        currentRefreshToken,
        email,
      );
    req.res.setHeader('Set-Cookie', [accessTokenCookie]);
  }
}
