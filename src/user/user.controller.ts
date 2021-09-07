import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Video } from 'src/video/schemas/video.schema';
import { VideoService } from 'src/video/video.service';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userSerivce: UserService,
    private readonly videoService: VideoService,
  ) {}
  @Get()
  async findAll(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ) {
    if (!offset || !limit) {
      throw new BadRequestException('offset and limit are required!');
    }
    return await this.userSerivce.findAll(offset, limit);
  }
  @Get(':userId/videos')
  getVideosByUserId(@Param('userId') userId: string): Promise<Video[]> {
    return this.videoService.getVideosByUserId(userId);
  }
}
