import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common';

import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Video } from './schemas/video.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { dest: 'uploads/' }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('ownerId') ownerId: string,
  ): Promise<Video> {
    const {
      originalname,
      destination,
      filename,
      size,
      mimetype,
    }: CreateVideoDto = file;
    if (path.basename(path.dirname(mimetype)) !== 'video') {
      throw new ForbiddenException('You can upload only video files!');
    }
    return await this.videoService.create({
      originalname,
      destination,
      filename,
      size,
      ownerId,
    });
  }

  @Get()
  findAll(): Promise<Video[]> {
    return this.videoService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Video> {
    return this.videoService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ): Promise<Video> {
    return this.videoService.update(id, updateVideoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Video> {
    return await this.videoService.remove(id);
  }
}
