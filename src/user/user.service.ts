import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { AuthDto } from 'src/auth/dto/auth.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async create(refreshToken: string, authDto: AuthDto): Promise<User> {
    const { email } = authDto;
    const hashedPassword: string = await bcrypt.hash(authDto.password, 10);
    return await this.userModel.create({
      email,
      hashedPassword,
      refreshToken,
    });
  }

  public findUserByEmail(email: string): Promise<User> | Promise<null> {
    return this.userModel.findOne({ email }).exec();
  }

  public async isEmailAndPasswordValid(email: string, password: string) {
    const user: User | null = await this.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException(
        `user with email = ${email} does not exist`,
      );
    }
    const isCorrectPassword: boolean = await bcrypt.compare(
      password,
      user.hashedPassword,
    );
    if (!isCorrectPassword) {
      throw new ForbiddenException(`wrong password`);
    }
    return user;
  }

  public async setCurrentRefreshToken(
    refreshToken: string,
    email: string,
  ): Promise<User> {
    return await this.userModel.findOneAndUpdate(
      { email },
      {
        refreshToken,
      },
    );
  }

  async removeRefreshToken(email: string): Promise<User> {
    return await this.userModel.findOneAndUpdate(
      { email },
      {
        refreshToken: null,
      },
    );
  }
}
