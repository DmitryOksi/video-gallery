import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserType } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private getJwtAccessToken(user: UserType): string {
    const payload: IAccessTokenPayload = this.getPayloadByUser(user);
    const accessToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
    return accessToken;
  }

  private getPayloadByUser(user: UserType): IAccessTokenPayload {
    return {
      email: user.email,
      id: user._id,
    };
  }

  private getJwtRefreshToken(user: UserType): string {
    const payload: IAccessTokenPayload = this.getPayloadByUser(user);
    const refreshToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
    return refreshToken;
  }

  private getCookieByRefreshToken(refreshToken: string): string {
    return `Refresh=${refreshToken}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}`;
  }

  private getCookieByAccessToken(accessToken: string): string {
    return `Authentication=${accessToken}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    )}`;
  }

  public async register(authDto: AuthDto) {
    const { email } = authDto;
    const oldUser: UserType = await this.userService.findUserByEmail(email);
    if (oldUser) {
      throw new BadRequestException(
        `User with email = ${email} already exist, Please login`,
      );
    }
    const user: UserType = await this.userService.create(authDto);
    const refreshToken: string = this.getJwtRefreshToken(user);
    const accessToken: string = this.getJwtAccessToken(user);
    const updatedUser: UserType = await this.userService.setCurrentRefreshToken(
      refreshToken,
      email,
    );
    return {
      user: updatedUser,
      refreshTokenCookie: this.getCookieByRefreshToken(refreshToken),
      accessTokenCookie: this.getCookieByAccessToken(accessToken),
    };
  }

  public async login(authDto: AuthDto) {
    const { email, password } = authDto;
    const user: UserType = await this.userService.isEmailAndPasswordValid(
      email,
      password,
    );
    const accessToken: string = this.getJwtAccessToken(user);
    const refreshToken: string = this.getJwtRefreshToken(user);
    const updatedUser: UserType = await this.userService.setCurrentRefreshToken(
      refreshToken,
      user.email,
    );
    const accessTokenCookie: string = this.getCookieByAccessToken(accessToken);
    const refreshTokenCookie: string =
      this.getCookieByRefreshToken(refreshToken);
    return {
      accessTokenCookie,
      refreshTokenCookie,
      user: updatedUser,
    };
  }

  private getCookiesForLogOut(): string[] {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  public async logout(email: string): Promise<string[]> {
    await this.userService.removeRefreshToken(email);
    return this.getCookiesForLogOut();
  }

  public async getAccessTokenCookieByRefreshToken(
    currentRefreshToken: string,
    email: string,
  ): Promise<string> {
    const user: UserType = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException(
        `User with email = ${email} does not exist. Please provide existing email.`,
      );
    }
    const isCorrectRefreshToken: boolean =
      currentRefreshToken === user.refreshToken;
    if (!isCorrectRefreshToken) {
      throw new ForbiddenException(`Wrong refresh token. Please login.`);
    }
    const accessToken: string = this.getJwtAccessToken(user);
    return this.getCookieByAccessToken(accessToken);
  }
}
