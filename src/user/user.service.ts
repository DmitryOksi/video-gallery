import { Injectable } from '@nestjs/common';
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
    const hashedRefreshToken: string = await bcrypt.hash(refreshToken, 10);
    return await this.userModel.create({
      email,
      hashedPassword,
      hashedRefreshToken,
    });
  }

  findUserByEmail(email: string): Promise<User> | Promise<null> {
    return this.userModel.findOne({ email }).exec();
  }

  public async setCurrentRefreshToken(
    refreshToken: string,
    email: string,
  ): Promise<User> {
    const hashedRefreshToken: string = await bcrypt.hash(refreshToken, 10);
    return await this.userModel.findOneAndUpdate(
      { email },
      {
        hashedRefreshToken,
      },
    );
  }

  async removeRefreshToken(email: string): Promise<string> {
    await this.userModel.findOneAndUpdate(
      { email },
      {
        hashedRefreshToken: null,
      },
    );
    return 'user successfuly logout';
  }
}
