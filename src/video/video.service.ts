import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Video, VideoDocument } from './schemas/video.schema';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
  ) {}

  create(video: Video): Promise<Video> {
    return this.videoModel.create(video);
  }

  getVideosByUserId(userId: string): Promise<Video[]> {
    return this.videoModel.find({ ownerId: userId }).exec();
  }

  findAll(): Promise<Video[]> {
    return this.videoModel.find().exec();
  }

  findById(id: string): Promise<Video> {
    return this.videoModel.findById(id).exec();
  }

  update(id: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    return this.videoModel
      .findByIdAndUpdate(id, updateVideoDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Video> {
    return this.videoModel.findByIdAndDelete(id);
  }
}
