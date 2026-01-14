import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CameraZoneType, StreamType } from '../entities/camera.entity';

export class CreateCameraDto {
  @ApiProperty({
    description: 'Camera ID',
    example: 'camera-01',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Camera name',
    example: 'Main Entrance Camera',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Camera location',
    example: 'Building A - Floor 1',
  })
  @IsString()
  location: string;

  @ApiPropertyOptional({
    description: 'Zone type',
    enum: CameraZoneType,
    example: CameraZoneType.ENTRANCE,
  })
  @IsOptional()
  @IsEnum(CameraZoneType)
  zone_type?: CameraZoneType;

  @ApiPropertyOptional({
    description: 'RTSP stream URL',
    example: 'rtsp://192.168.1.100:554/stream',
  })
  @IsOptional()
  @IsString()
  rtsp_url?: string;

  @ApiPropertyOptional({
    description: 'Stream URL (file path or HTTP URL)',
    example: '/path/to/video.mp4',
  })
  @IsOptional()
  @IsString()
  stream_url?: string;

  @ApiPropertyOptional({
    description: 'Stream type',
    enum: StreamType,
    example: StreamType.FILE,
  })
  @IsOptional()
  @IsEnum(StreamType)
  stream_type?: StreamType;

  @ApiPropertyOptional({
    description: 'Frames per second',
    example: 25,
    minimum: 1,
    maximum: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  fps?: number;

  @ApiPropertyOptional({
    description: 'Video resolution',
    example: '1920x1080',
  })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiProperty({
    description: 'Building ID',
    example: 'uuid-here',
  })
  @IsUUID()
  building_id: string;
}
