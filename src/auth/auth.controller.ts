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
import { UserType } from 'src/user/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}
  @HttpCode(200)
  @Post('login')
  async login(@Req() req: Request): Promise<UserType> {
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
  async register(@Req() req: Request): Promise<UserType> {
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
      user: { id },
    } = req;
    const cookiesForLogOut: string[] = await this.authService.logout(id);
    req.res.setHeader('Set-Cookie', cookiesForLogOut);
  }

  @HttpCode(200)
  @Get('access-token')
  async getAccessTokenByRefreshToken(@Req() req: Request) {
    const currentRefreshToken = req.cookies['Refresh'];
    if (!currentRefreshToken) {
      throw new UnauthorizedException(
        'Cookies does not include refresh token. Please login.',
      );
    }
    const payload: IAccessTokenPayload =
      this.jwtService.verify(currentRefreshToken);
    const accessTokenCookie =
      await this.authService.getAccessTokenCookieByRefreshToken(
        currentRefreshToken,
        payload.id,
      );
    req.res.setHeader('Set-Cookie', [accessTokenCookie]);
  }
}
