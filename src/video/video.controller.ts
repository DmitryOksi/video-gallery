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
  Res,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Video } from './schemas/video.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Response } from 'express';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { dest: 'uploads/' }))
  async uploadVideo(
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

  @Get(':id')
  async watchVideoById(@Res() res: Response, @Param('id') id: string) {
    const { destination, filename }: Video = await this.videoService.findById(
      id,
    );
    const filePath: string = path.join(destination, filename);
    const file = createReadStream(join(process.cwd(), filePath));
    file.pipe(res);
  }

  @Get()
  findAll(): Promise<Video[]> {
    return this.videoService.findAll();
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
