import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { VideoModule } from 'src/video/video.module';

const userMiddleware = {
  virtuals: true,
  versionKey: false,
  transform: function (doc: User, ret: User & { _id }) {
    delete ret._id;
    delete ret.hashedPassword;
    delete ret.refreshToken;
    return ret;
  },
};

@Module({
  imports: [
    VideoModule,
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          schema.set('toJSON', userMiddleware);
          return schema;
        },
      },
    ]),
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
