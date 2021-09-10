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
  Query,
  HttpCode,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UploadVideoDto } from './dto/upload-video.dto';
import { ShareVideoDto } from './dto/share-video.dto';
import { Video } from './schemas/video.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Response, Request } from 'express';
import { SafeUser, UserType } from 'src/user/schemas/user.schema';
import { ErrorMessages } from 'src/helpers/error.messages';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { QueryParamsDto } from 'src/helpers/query-params.dto';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('own')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'List of uploaded videos',
    isArray: true,
    type: Video,
  })
  async getUploaded(
    @Req() req: Request & { user: IAccessTokenPayload },
    @Query() queryParams: QueryParamsDto,
  ): Promise<Video[]> {
    const { offset, limit } = queryParams;
    const {
      user: { id: userId },
    } = req;
    return await this.videoService.getUploaded(userId, offset, limit);
  }

  @Get('common')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'List of shared videos',
    isArray: true,
    type: Video,
  })
  async getShared(
    @Req() req: Request & { user: IAccessTokenPayload },
    @Query() queryParams: QueryParamsDto,
  ): Promise<Video[]> {
    const { offset, limit } = queryParams;
    const {
      user: { id: userId },
    } = req;
    return await this.videoService.getShared(userId, offset, limit);
  }

  @Post('upload')
  @HttpCode(201)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadVideoDto,
  })
  @UseInterceptors(FileInterceptor('file', { dest: 'uploads/' }))
  @ApiCreatedResponse({
    description: 'Video uploaded',
    type: Video,
  })
  @ApiForbiddenResponse({
    description: ErrorMessages.USER_CAN_UPLOAD_ONLY_VIDEO_FILE,
  })
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
      throw new ForbiddenException(
        ErrorMessages.USER_CAN_UPLOAD_ONLY_VIDEO_FILE,
      );
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
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Video shared',
    type: SafeUser,
  })
  @ApiBadRequestResponse({
    description: ErrorMessages.USER_ALREADY_HAVE_PERMISSION_TO_WATCH_VIDEO,
  })
  @ApiForbiddenResponse({
    description: ErrorMessages.USER_DO_NOT_HAVE_PERMISSION_TO_SHARE_VIDEO,
  })
  @ApiNotFoundResponse({
    description: ErrorMessages.USER_DOES_NOT_EXIST,
  })
  async giveAccessToWatch(
    @Req() req: Request & { user: IAccessTokenPayload },
    @Body() body: ShareVideoDto,
  ): Promise<UserType> {
    const { videoId, userId } = body;
    const {
      user: { id: ownerId },
    } = req;
    return await this.videoService.giveAccessToWatch(videoId, ownerId, userId);
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Video streamed' })
  @ApiForbiddenResponse({
    description: ErrorMessages.USER_DO_NOT_HAVE_PERMISSION_TO_WATCH_VIDEO,
  })
  @ApiNotFoundResponse({ description: ErrorMessages.VIDEO_DOES_NOT_EXIST })
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
        ErrorMessages.USER_DO_NOT_HAVE_PERMISSION_TO_WATCH_VIDEO,
      );
    }
    const { destination, filename }: Video = await this.videoService.findById(
      id,
    );
    const filePath: string = path.join(destination, filename);
    const file = createReadStream(join(process.cwd(), filePath));
    file.pipe(res);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Video deleted',
    type: Video,
  })
  @ApiForbiddenResponse({
    description: ErrorMessages.USER_DO_NOT_HAVE_PERMISSION_TO_DELETE_VIDEO,
  })
  @ApiNotFoundResponse({
    description: ErrorMessages.VIDEO_DOES_NOT_EXIST,
    status: 404,
  })
  @ApiBadRequestResponse({
    description: ErrorMessages.FAILED_TO_DELETE_VIDEO_FILE,
    status: 204,
  })
  async delete(
    @Param('id') id: string,
    @Req() req: Request & { user: IAccessTokenPayload },
  ): Promise<Video> {
    const {
      user: { id: ownerId },
    } = req;
    return await this.videoService.delete(id, ownerId);
  }
}
