import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './schemas/video.schema';

const videoMiddleware = {
  virtuals: true,
  versionKey: false,
  transform: function (doc: Video, ret: Video & { _id }) {
    delete ret._id;
    return ret;
  },
};

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Video.name,
        useFactory: () => {
          const schema = VideoSchema;
          schema.set('toJSON', videoMiddleware);
          return schema;
        },
      },
    ]),
  ],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
