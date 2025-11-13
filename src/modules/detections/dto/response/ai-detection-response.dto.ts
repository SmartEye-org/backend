import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { AiDetectionDto } from '../ai-detection.dto';

export class AiDetectionResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiDetectionDto)
  detections: AiDetectionDto[];

  @IsNumber()
  total_persons: number;

  @IsString()
  timestamp: string;
}
