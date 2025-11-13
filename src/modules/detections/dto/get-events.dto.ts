import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetEventsDto {
  @ApiPropertyOptional({
    description: 'Number of events to retrieve',
    example: 50,
    default: 50,
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Number of events to skip',
    example: 0,
    default: 0,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Filter by camera ID',
    example: 'camera-01',
  })
  @IsString()
  @IsOptional()
  camera_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by person type',
    example: 'resident',
    enum: ['resident', 'guest', 'unknown'],
  })
  @IsString()
  @IsOptional()
  person_type?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO format)',
    example: '2025-11-01T00:00:00.000Z',
  })
  @IsString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO format)',
    example: '2025-11-30T23:59:59.999Z',
  })
  @IsString()
  @IsOptional()
  end_date?: string;
}
