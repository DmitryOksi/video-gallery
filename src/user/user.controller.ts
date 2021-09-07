import { Controller, Get, Param } from '@nestjs/common';
import { Video } from 'src/video/schemas/video.schema';
import { VideoService } from 'src/video/video.service';

@Controller('users')
export class UserController {
  constructor(private readonly videoService: VideoService) {}
  @Get(':userId/videos')
  getVideosByUserId(@Param('userId') userId: string): Promise<Video[]> {
    return this.videoService.getVideosByUserId(userId);
  }
}
