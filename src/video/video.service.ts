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
        'You can not share video with yourself, you already have access',
      );
    }
    const video: Video = await this.findById(videoId);
    if (video.ownerId.toString() !== ownerId) {
      throw new ForbiddenException(`You do not have permission to share video`);
    }
    return await this.userService.giveAccessToWatchVideo(videoId, userId);
  }

  getUploaded(userId: string): Promise<Video[]> {
    return this.videoModel.find({ ownerId: userId }).exec();
  }

  async getShared(userId: string): Promise<Video[]> {
    const { sharedVideoIds }: UserType = await this.userService.findById(
      userId,
    );
    return await this.videoModel.find().where('_id').in(sharedVideoIds);
  }

  findAll(): Promise<Video[]> {
    return this.videoModel.find().exec();
  }

  async findById(id: string): Promise<Video> {
    const video: Video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Provided video does not exist');
    }
    return video;
  }

  update(id: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    return this.videoModel
      .findByIdAndUpdate(id, updateVideoDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Video> {
    return this.videoModel.findByIdAndDelete(id);
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
