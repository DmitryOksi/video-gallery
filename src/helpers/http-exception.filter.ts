import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from './logger';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    logger.error({
      timestamp: new Date().toISOString(),
      statusCode: status,
      message: exception.message,
      method: request.method,
      path: request.url,
      body: request.body,
      params: request.params,
      query: request.query,
    });

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
