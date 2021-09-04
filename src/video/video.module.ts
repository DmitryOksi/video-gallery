import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {Video ,VideoSchema} from './schemas/video.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Video.name,
        useFactory: () => {
        const schema = VideoSchema;
        return schema;
        },
      },
    ]),
  ],
  controllers: [VideoController],
  providers: [VideoService]
})

export class VideoModule {}
