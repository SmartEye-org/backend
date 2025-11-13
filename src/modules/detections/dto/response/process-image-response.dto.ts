import { ApiProperty } from '@nestjs/swagger';
import { DetectionItemDto } from './detectioin-item-response.dto';

export class ProcessImageResponseDto {
  @ApiProperty({ type: [DetectionItemDto] })
  detections: DetectionItemDto[];

  @ApiProperty()
  total_persons: number;

  @ApiProperty()
  saved_detections: number;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  camera_id: string;

  @ApiProperty()
  camera_name: string;
}
