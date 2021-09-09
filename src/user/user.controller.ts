import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ErrorMessages } from 'src/helpers/error.messages';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userSerivce: UserService) {}
  @Get()
  async findAll(
    @Query('offset') offset: string | number,
    @Query('limit') limit: string | number,
  ) {
    if (!offset || !limit) {
      throw new BadRequestException(ErrorMessages.PROVIDE_OFFSET_AND_LIMIT);
    }
    return await this.userSerivce.findAll(offset, limit);
  }
}
