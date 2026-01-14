import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetDetectionsDto {
  @ApiPropertyOptional({
    description: 'Number of detections to retrieve',
    example: 50,
    default: 50,
    minimum: 1,
    maximum: 200,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  limit?: number = 50;
}
