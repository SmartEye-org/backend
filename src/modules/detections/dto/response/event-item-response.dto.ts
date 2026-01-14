import { ApiProperty } from '@nestjs/swagger';

export class EventItemDto {
  @ApiProperty({ description: 'Event ID' })
  id: string;

  @ApiProperty({ description: 'Formatted event ID', example: 'EVT-000001' })
  event_id: string;

  @ApiProperty({ description: 'Camera ID' })
  camera_id: string;

  @ApiProperty({ description: 'Camera name' })
  camera_name: string;

  @ApiProperty({ description: 'Detection timestamp' })
  detected_time: string;

  @ApiProperty({ description: 'Track ID' })
  track_id: string;

  @ApiProperty({ description: 'Person type' })
  person_type: string;

  @ApiProperty({ description: 'Person name', nullable: true })
  person_name: string | null;

  @ApiProperty({ description: 'Face ID' })
  face_id: string;

  @ApiProperty({ description: 'Detected action' })
  action: string;

  @ApiProperty({ description: 'Detection confidence (0-100)' })
  confidence: number;

  @ApiProperty({ description: 'Face confidence (0-100)', nullable: true })
  face_confidence: number | null;

  @ApiProperty({ description: 'Event type' })
  event_type: string;

  @ApiProperty({ description: 'Event details' })
  event_details: string;

  @ApiProperty({
    description: 'Alert level',
    enum: ['normal', 'warning', 'critical'],
  })
  alert_level: 'normal' | 'warning' | 'critical';

  @ApiProperty({ description: 'Bounding box coordinates', type: [Number] })
  bbox: number[];

  @ApiProperty({ description: 'Snapshot URL' })
  snapshot_url: string;

  @ApiProperty({ description: 'Has violation detected' })
  has_violation: boolean;

  @ApiProperty({ description: 'Is acknowledged' })
  is_acknowledged: boolean;

  @ApiProperty({ description: 'Notes', nullable: true })
  notes: string | null;
}

export class GetEventsResponseDto {
  @ApiProperty({ type: [EventItemDto] })
  events: EventItemDto[];

  @ApiProperty({ description: 'Total number of events' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Total pages' })
  pages: number;
}
