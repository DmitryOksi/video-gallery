import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthentificationMiddleware implements NestMiddleware {
  use(
    req: Request & { user: IAccessTokenPayload },
    res: Response,
    next: NextFunction,
  ) {
    const accessToken = req.cookies['Authentication'];
    if (!accessToken) {
      throw new UnauthorizedException('provide access token');
    }
    jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      (err, user) => {
        if (err) {
          throw new ForbiddenException('not valid token');
        }
        req.user = user;
      },
    );
    next();
  }
}
