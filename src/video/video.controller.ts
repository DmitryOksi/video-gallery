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
  Req,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Video } from './schemas/video.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Response, Request } from 'express';
import { UserType } from 'src/user/schemas/user.schema';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { dest: 'uploads/' }))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: IAccessTokenPayload },
  ): Promise<Video> {
    const {
      originalname,
      destination,
      filename,
      size,
      mimetype,
    }: CreateVideoDto = file;
    const {
      user: { id: ownerId },
    } = req;
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

  @Patch('access')
  async giveAccessToWatch(
    @Req() req: Request & { user: IAccessTokenPayload },
    @Body('videoId') videoId: string,
    @Body('userId') userId: string,
  ): Promise<UserType> {
    const {
      user: { id: ownerId },
    } = req;
    return await this.videoService.giveAccessToWatch(videoId, ownerId, userId);
  }

  @Get(':id')
  async watchById(
    @Res() res: Response,
    @Req() req: Request & { user: IAccessTokenPayload },
    @Param('id') id: string,
  ) {
    const {
      user: { id: ownerId },
    } = req;
    const isUserAccessToGet: boolean =
      await this.videoService.checkUserAccessToGet(id, ownerId);
    if (!isUserAccessToGet) {
      throw new ForbiddenException(
        'You do not have access to watch provided video',
      );
    }
    const { destination, filename }: Video = await this.videoService.findById(
      id,
    );
    const filePath: string = path.join(destination, filename);
    const file = createReadStream(join(process.cwd(), filePath));
    file.pipe(res);
  }

  @Get()
  async getByUserId(@Req() req: Request & { user: IAccessTokenPayload }) {
    const {
      user: { id: userId },
    } = req;
    const uploadedVideos: Video[] = await this.videoService.getUploaded(userId);
    const sharedVideos: Video[] = await this.videoService.getShared(userId);
    return { uploadedVideos, sharedVideos };
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ): Promise<Video> {
    return this.videoService.update(id, updateVideoDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request & { user: IAccessTokenPayload },
  ): Promise<Video> {
    const {
      user: { id: ownerId },
    } = req;
    const isUserAccessToDelete: boolean =
      await this.videoService.checkUserAccessToDelete(id, ownerId);
    if (!isUserAccessToDelete) {
      throw new ForbiddenException(
        'You do not have access to delete provided video',
      );
    }
    return await this.videoService.delete(id);
  }
}
