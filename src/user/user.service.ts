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
import { ErrorMessages } from 'src/helpers/error.messages';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public async create(authDto: AuthDto): Promise<UserType> {
    const { email } = authDto;
    const hashedPassword: string = await bcrypt.hash(authDto.password, 10);
    return await this.userModel.create({
      email,
      hashedPassword,
    });
  }

  public async findAll(
    offset: string | number,
    limit: string | number,
  ): Promise<UserType[]> {
    return await this.userModel
      .find()
      .skip(+offset)
      .limit(+limit);
  }

  public findUserByEmail(email: string): Promise<UserType> | Promise<null> {
    return this.userModel.findOne({ email }).exec();
  }

  public findById(id: string): Promise<UserType> {
    return this.userModel.findById(id).exec();
  }

  public async isEmailAndPasswordValid(
    email: string,
    password: string,
  ): Promise<UserType> {
    const user: UserType | null = await this.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException(ErrorMessages.USER_DOES_NOT_EXIST);
    }
    const isCorrectPassword: boolean = await bcrypt.compare(
      password,
      user.hashedPassword,
    );
    if (!isCorrectPassword) {
      throw new ForbiddenException(ErrorMessages.WRONG_PASSWORD);
    }
    return user;
  }

  public async setCurrentRefreshToken(
    refreshToken: string,
    id: string,
  ): Promise<UserType> {
    return await this.userModel.findByIdAndUpdate(id, {
      refreshToken,
    });
  }

  async removeRefreshToken(id: string): Promise<UserType> {
    const user: UserDocument = await this.userModel.findById(id);
    user.refreshToken = null;
    return await user.save();
  }

  async giveAccessToWatchVideo(
    videoId: string,
    userId: string,
  ): Promise<UserType> {
    const user: UserDocument = await this.userModel.findById(userId);
    if (!user) {
      throw new ForbiddenException(ErrorMessages.USER_DOES_NOT_EXIST);
    }
    if (user.sharedVideoIds.includes(videoId)) {
      throw new ForbiddenException(
        ErrorMessages.USER_ALREADY_HAVE_PERMISSION_TO_WATCH_VIDEO,
      );
    }
    user.sharedVideoIds.push(videoId);
    return await user.save();
  }
}
