import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Data retrieved successfully' })
  message: string;

  @ApiProperty({ description: 'Array of data items' })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      total: 100,
      page: 1,
      limit: 10,
      totalPages: 10,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  @ApiProperty({ example: '2025-11-13T08:26:56.868Z' })
  timestamp: string;

  constructor(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Data retrieved successfully',
  ) {
    this.success = true;
    this.statusCode = 200;
    this.message = message;
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    this.timestamp = new Date().toISOString();
  }
}
