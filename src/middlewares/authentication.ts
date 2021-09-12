import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ErrorMessages } from 'src/errors/error.messages';

@Injectable()
export class AuthentificationMiddleware implements NestMiddleware {
  use(
    req: Request & { user: IAccessTokenPayload },
    res: Response,
    next: NextFunction,
  ) {
    const accessToken = req.cookies['Authentication'];
    if (!accessToken) {
      throw new UnauthorizedException(ErrorMessages.PROVIDE_ACCESS_TOKEN);
    }
    jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      (err, user) => {
        if (err) {
          throw new ForbiddenException(ErrorMessages.NOT_VALID_ACCESS_TOKEN);
        }
        req.user = user;
      },
    );
    next();
  }
}
