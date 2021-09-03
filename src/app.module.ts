import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://admin:12345@localhost/admin'),
    VideoModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
