import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getMongoConfig } from './configs/mongo.config';
import { VideoModule } from './video/video.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AuthentificationMiddleware } from './middlewares/authentication';
import { VideoController } from './video/video.controller';
import { AuthController } from './auth/auth.controller';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './helpers/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfig,
    }),
    VideoModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthentificationMiddleware)
      .exclude(
        { path: 'api/auth/register', method: RequestMethod.POST },
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'api/auth/access-token', method: RequestMethod.GET },
      )
      .forRoutes(VideoController, AuthController);
  }
}
