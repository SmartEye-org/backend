import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ViolationType, ViolationSeverity } from '../entities/violation.entity';
import { PersonType } from 'src/modules/detections/entities/detection.entity';

export class CreateViolationDto {
  @ApiProperty({ example: 'track-001', description: 'Tracking ID of the person' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  track_id: string;

  @ApiPropertyOptional({ enum: PersonType })
  @IsEnum(PersonType)
  @IsOptional()
  person_type?: PersonType;

  @ApiPropertyOptional({ example: 'resident-001' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  person_id?: string;

  @ApiProperty({ enum: ViolationType })
  @IsEnum(ViolationType)
  violation_type: ViolationType;

  @ApiProperty({ enum: ViolationSeverity })
  @IsEnum(ViolationSeverity)
  severity: ViolationSeverity;

  @ApiProperty({ example: 'camera-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  camera_id: string;

  @ApiProperty({ example: 'Hành lang tầng 3' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location: string;

  @ApiPropertyOptional({ example: 'http://storage/snapshots/v001.jpg' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  snapshot_url?: string;

  @ApiPropertyOptional({ example: 'http://storage/videos/v001.mp4' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  video_url?: string;

  @ApiPropertyOptional({ example: 'Person detected lying in corridor' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-01-14T10:30:00Z' })
  @IsDateString()
  timestamp: string;
}
