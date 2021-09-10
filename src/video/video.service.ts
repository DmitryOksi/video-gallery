import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserType } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Video, VideoDocument } from './schemas/video.schema';
import * as fs from 'fs';
import * as path from 'path';
import { ErrorMessages } from 'src/helpers/error.messages';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>,
    private readonly userService: UserService,
  ) {}

  create(video: Video): Promise<Video> {
    return this.videoModel.create(video);
  }

  public async giveAccessToWatch(
    videoId: string,
    ownerId: string,
    userId: string,
  ): Promise<UserType> {
    if (userId === ownerId) {
      throw new BadRequestException(
        ErrorMessages.USER_ALREADY_HAVE_PERMISSION_TO_WATCH_VIDEO,
      );
    }
    const video: Video = await this.findById(videoId);
    if (video.ownerId.toString() !== ownerId) {
      throw new ForbiddenException(
        ErrorMessages.USER_DO_NOT_HAVE_PERMISSION_TO_SHARE_VIDEO,
      );
    }
    return await this.userService.giveAccessToWatchVideo(videoId, userId);
  }

  getUploaded(
    userId: string,
    offset: string | number,
    limit: string | number,
  ): Promise<Video[]> {
    return this.videoModel
      .find({ ownerId: userId })
      .skip(+offset)
      .limit(+limit)
      .exec();
  }

  async getShared(
    userId: string,
    offset: string | number,
    limit: string | number,
  ): Promise<Video[]> {
    const { sharedVideoIds }: UserType = await this.userService.findById(
      userId,
    );
    return await this.videoModel
      .find()
      .where('_id')
      .in(sharedVideoIds)
      .skip(+offset)
      .limit(+limit);
  }

  async findById(id: string): Promise<Video> {
    const video: Video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException(ErrorMessages.VIDEO_DOES_NOT_EXIST);
    }
    return video;
  }

  async delete(id: string, ownerId: string): Promise<Video> {
    const isUserAccessToDelete: boolean = await this.checkUserAccessToDelete(
      id,
      ownerId,
    );
    if (!isUserAccessToDelete) {
      throw new ForbiddenException(
        ErrorMessages.USER_DO_NOT_HAVE_PERMISSION_TO_DELETE_VIDEO,
      );
    }
    const video: Video = await this.findById(id);
    const filePath: string = path.join(video.destination, video.filename);
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      throw new BadRequestException(ErrorMessages.FAILED_TO_DELETE_VIDEO_FILE);
    }
    return await this.videoModel.findByIdAndDelete(id);
  }

  async checkUserAccessToGet(id: string, ownerId: string): Promise<boolean> {
    const video: Video = await this.findById(id);
    const user: UserType = await this.userService.findById(ownerId);
    return (
      video.ownerId.toString() === ownerId || user.sharedVideoIds.includes(id)
    );
  }

  async checkUserAccessToDelete(id: string, ownerId: string): Promise<boolean> {
    const video: Video = await this.findById(id);
    return video.ownerId.toString() === ownerId;
  }
}
