import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StartStreamDto {
  @ApiPropertyOptional({
    description: 'Target FPS for frame processing',
    example: 5,
    minimum: 1,
    maximum: 30,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(30)
  fps?: number = 5;

  @ApiPropertyOptional({
    description: 'Buffer size for frames',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(50)
  buffer_size?: number = 10;
}
