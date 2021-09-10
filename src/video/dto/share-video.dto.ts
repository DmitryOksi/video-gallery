import { ApiProperty } from '@nestjs/swagger';
export class ShareVideoDto {
  @ApiProperty({ type: String, description: 'videoId' })
  videoId: string;
  @ApiProperty({ type: String, description: 'userId' })
  userId: string;
}
