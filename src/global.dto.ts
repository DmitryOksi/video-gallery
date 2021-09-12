import { ApiProperty } from '@nestjs/swagger';

export class QueryParamsDto {
  @ApiProperty({ type: Number, description: 'Limit of documents' })
  limit: string | number;

  @ApiProperty({ type: Number, description: 'Number of skipped documents' })
  offset: string | number;
}
