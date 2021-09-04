import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //TODO: logic to register user
  //TODO: logic to logout user
  //TODO: logic to get accessToken by refreshToken
  @Post('login')
  async login(@Body() authDto: AuthDto) {
    const accessToken: string = this.authService.getJwtAccessToken(
      authDto.email,
    );
    const refreshToken: string = this.authService.getJwtRefreshToken(
      authDto.email,
    );
    //TODO: logic to compare login and password with existing user;
    //TODO: logic to send bad http response code for not existing user, and existing user with password

    //TODO: logic to update update refresh token to user
    return {
      accessToken,
      refreshToken,
    };
  }
}
