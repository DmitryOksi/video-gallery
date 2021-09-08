import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userSerivce: UserService) {}
  @Get()
  async findAll(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ) {
    if (!offset || !limit) {
      throw new BadRequestException('offset and limit are required!');
    }
    return await this.userSerivce.findAll(offset, limit);
  }
}
