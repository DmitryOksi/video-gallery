import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

interface TokenPayload {
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private getJwtAccessToken(email: string): string {
    const payload: TokenPayload = { email };
    const accessToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
    return accessToken;
  }

  private getJwtRefreshToken(email: string): string {
    const payload: TokenPayload = { email };
    const refreshToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
    return refreshToken;
  }

  public async register(authDto: AuthDto) {
    const { email } = authDto;
    const oldUser: User = await this.usersService.findUserByEmail(email);
    if (oldUser) {
      throw new BadRequestException(`user with email = ${email} already exist`);
    }
    const refreshToken: string = this.getJwtRefreshToken(email);
    const accessToken: string = this.getJwtAccessToken(email);
    const user: User = await this.usersService.create(refreshToken, authDto);
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  public async login(authDto: AuthDto) {
    const { email } = authDto;
    const user: User | null = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException(`user with email = ${email} does not exist`);
    }
    const isCorrectPassword: boolean = await bcrypt.compare(
      authDto.password,
      user.hashedPassword,
    );
    if (!isCorrectPassword) {
      throw new ForbiddenException(`wrong password`);
    }
    const accessToken: string = this.getJwtAccessToken(email);
    const refreshToken: string = this.getJwtRefreshToken(email);
    const updatedUser: User = await this.usersService.setCurrentRefreshToken(
      refreshToken,
      user.email,
    );
    return {
      user: updatedUser,
      accessToken,
      refreshToken,
    };
  }
}
