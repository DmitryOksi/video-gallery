import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserType, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { AuthDto } from 'src/auth/dto/auth.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async create(authDto: AuthDto): Promise<UserType> {
    const { email } = authDto;
    const hashedPassword: string = await bcrypt.hash(authDto.password, 10);
    return await this.userModel.create({
      email,
      hashedPassword,
    });
  }

  public async findAll(offset: number, limit: number): Promise<UserType[]> {
    return await this.userModel
      .find()
      .skip(+offset)
      .limit(+limit);
  }

  public findUserByEmail(email: string): Promise<UserType> | Promise<null> {
    return this.userModel.findOne({ email }).exec();
  }

  public async isEmailAndPasswordValid(email: string, password: string): Promise<UserType> {
    const user: UserType | null = await this.findUserByEmail(email);
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
  ): Promise<UserType> {
    return await this.userModel.findOneAndUpdate(
      { email },
      {
        refreshToken,
      },
    );
  }

  async removeRefreshToken(email: string): Promise<UserType> {
    return await this.userModel.findOneAndUpdate(
      { email },
      {
        refreshToken: null,
      },
    );
  }
}
