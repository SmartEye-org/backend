import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = unknown> {
  @ApiProperty({ example: true, description: 'Request success status' })
  success: boolean;

  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Request processed successfully' })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ example: '2025-11-13T08:26:56.868Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/detections/process', required: false })
  path?: string;

  constructor(data: T, message = 'Success', statusCode = 200) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  // Helper method to check if object is ApiResponseDto
  static isApiResponse(obj: unknown): obj is ApiResponseDto {
    return obj instanceof ApiResponseDto;
  }
}
