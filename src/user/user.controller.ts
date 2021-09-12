import {
  Controller,
  Get,
  Query,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ErrorMessages } from 'src/errors/error.messages';
import { UserService } from './user.service';
import { QueryParamsDto } from '../global.dto';
import { SafeUser, UserType } from './schemas/user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userSerivce: UserService) {}
  @Get()
  @ApiCookieAuth()
  @HttpCode(200)
  @ApiOkResponse({
    description: 'List of users',
    isArray: true,
    type: SafeUser,
  })
  @ApiBadRequestResponse({
    description: ErrorMessages.PROVIDE_OFFSET_AND_LIMIT,
  })
  async findAll(@Query() queryParams: QueryParamsDto): Promise<UserType[]> {
    const { offset, limit } = queryParams;
    if (!offset || !limit) {
      throw new BadRequestException(ErrorMessages.PROVIDE_OFFSET_AND_LIMIT);
    }
    return await this.userSerivce.findAll(offset, limit);
  }
}
