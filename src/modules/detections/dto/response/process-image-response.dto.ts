import { ApiProperty } from '@nestjs/swagger';

export class DetectionItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  camera_id: string;

  @ApiProperty()
  track_id: string;

  @ApiProperty({ type: [Number] })
  bbox: number[];

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  person_type: string;

  @ApiProperty({ nullable: true })
  person_name: string | null;

  @ApiProperty({ nullable: true })
  face_confidence: number | null;

  @ApiProperty()
  violation_detected: boolean;

  @ApiProperty()
  timestamp: string;
}
