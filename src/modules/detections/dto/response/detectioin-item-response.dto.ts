import { ApiProperty } from '@nestjs/swagger';
import { PersonType } from '../../entities/detection.entity';

export class DetectionItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  track_id: string;

  @ApiProperty({ enum: PersonType })
  person_type: PersonType;

  @ApiProperty({ nullable: true })
  person_name: string | null;

  @ApiProperty({ description: 'Confidence percentage (0-100)' })
  confidence: number;

  @ApiProperty()
  timestamp: Date;
}
