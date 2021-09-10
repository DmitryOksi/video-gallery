import {
  Controller,
  Get,
  Query,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import { ErrorMessages } from 'src/helpers/error.messages';
import { UserService } from './user.service';
import { QueryParamsDto } from '../helpers/query-params.dto';
import { SafeUser, UserType } from './schemas/user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userSerivce: UserService) {}

  @Get()
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
