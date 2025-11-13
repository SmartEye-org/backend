import {
  IsNumber,
  IsString,
  IsBoolean,
  IsArray,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class AiDetectionDto {
  @IsNumber()
  person_id: number;

  @IsString()
  @IsOptional()
  track_id?: string;

  @IsNumber()
  @IsOptional()
  frame_id?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  bbox: number[];

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @IsString()
  @IsOptional()
  action?: string;

  @IsBoolean()
  face_detected: boolean;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  face_encoding?: number[];

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  face_confidence?: number;

  @IsString()
  timestamp: string;
}
