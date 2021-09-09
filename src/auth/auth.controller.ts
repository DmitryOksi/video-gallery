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
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorMessages } from 'src/helpers/error.messages';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}
  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: AuthDto })
  @ApiOkResponse({ description: 'User login' })
  @ApiBadRequestResponse({
    description: ErrorMessages.PROVIDE_EMAIL_AND_PASSWORD,
  })
  @ApiUnauthorizedResponse({
    description: ErrorMessages.USER_DOES_NOT_EXIST,
  })
  @ApiForbiddenResponse({ description: ErrorMessages.WRONG_PASSWORD })
  async login(@Req() req: Request): Promise<UserType> {
    const authDto: AuthDto = req.body;
    const { email, password } = authDto;
    if (!email || !password) {
      throw new BadRequestException(ErrorMessages.PROVIDE_EMAIL_AND_PASSWORD);
    }
    const { accessTokenCookie, refreshTokenCookie, user } =
      await this.authService.login(authDto);
    req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    return user;
  }

  @Post('register')
  @HttpCode(201)
  @ApiBody({ type: AuthDto })
  @ApiCreatedResponse({ description: 'User registration' })
  @ApiBadRequestResponse({
    description: ErrorMessages.PROVIDE_EMAIL_AND_PASSWORD,
  })
  async register(@Req() req: Request): Promise<UserType> {
    const authDto: AuthDto = req.body;
    const { email, password } = authDto;
    if (!email || !password) {
      throw new BadRequestException(ErrorMessages.PROVIDE_EMAIL_AND_PASSWORD);
    }
    const { accessTokenCookie, refreshTokenCookie, user } =
      await this.authService.register(authDto);
    req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    return user;
  }

  @HttpCode(200)
  @Post('logout')
  @ApiOkResponse({ description: 'User logout' })
  async logout(@Req() req: Request & { user: IAccessTokenPayload }) {
    const {
      user: { id },
    } = req;
    const cookiesForLogOut: string[] = await this.authService.logout(id);
    req.res.setHeader('Set-Cookie', cookiesForLogOut);
  }

  @HttpCode(200)
  @Get('access-token')
  @ApiOkResponse({ description: 'Get access token by refresh token' })
  async getAccessTokenByRefreshToken(@Req() req: Request) {
    const currentRefreshToken = req.cookies['Refresh'];
    if (!currentRefreshToken) {
      throw new UnauthorizedException(ErrorMessages.PROVIDE_REFRESH_TOKEN);
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
