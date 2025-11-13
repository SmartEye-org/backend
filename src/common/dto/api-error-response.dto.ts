import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  message: string;

  @ApiProperty({ example: 'Validation failed', required: false })
  error?: string;

  @ApiProperty({ type: [String], required: false })
  errors?: string[];

  @ApiProperty({ example: '2025-11-13T08:26:56.868Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/detections/process' })
  path: string;

  constructor(
    message: string,
    statusCode: number = 400,
    error?: string,
    errors?: string[],
    path?: string,
  ) {
    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
    this.path = path || '';
  }
}
