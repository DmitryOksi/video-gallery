import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserService } from 'src/user/user.service';

interface TokenPayload {
    email: string
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    public getJwtAccessToken(email: string): string {
        const payload: TokenPayload = { email };
        const accessToken: string = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
        });
        return accessToken;
    }

    public getJwtRefreshToken(email: string): string {
        const payload: TokenPayload = { email };
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`
        });
        return refreshToken; 
    }
}
