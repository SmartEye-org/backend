import { ApiProperty } from '@nestjs/swagger';

export class GetDetectionsResponseDto {
  @ApiProperty({ description: 'Array of detection records' })
  detections: any[];

  @ApiProperty()
  total: number;
}
