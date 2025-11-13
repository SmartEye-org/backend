import { ApiProperty } from '@nestjs/swagger';

export class TodayDetectionsDto {
  @ApiProperty({ example: 9 })
  total: number;

  @ApiProperty({ example: 0 })
  change_percent: number;

  @ApiProperty({
    example: {
      residents: 0,
      guests: 0,
      unknown: 9,
    },
  })
  breakdown: {
    residents: number;
    guests: number;
    unknown: number;
  };
}

export class ActiveCamerasDto {
  @ApiProperty({ example: 5 })
  online: number;

  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({ example: 0 })
  offline: number;
}

export class ViolationsTodayDto {
  @ApiProperty({ example: 0 })
  total: number;

  @ApiProperty({
    example: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
  })
  by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };

  @ApiProperty({ example: 0 })
  unresolved: number;
}

export class ActiveTracksDto {
  @ApiProperty({ example: 0 })
  total: number;
}

export class DashboardResponseDto {
  @ApiProperty({ type: TodayDetectionsDto })
  today_detections: TodayDetectionsDto;

  @ApiProperty({ type: ActiveCamerasDto })
  active_cameras: ActiveCamerasDto;

  @ApiProperty({ type: ViolationsTodayDto })
  violations_today: ViolationsTodayDto;

  @ApiProperty({ type: ActiveTracksDto })
  active_tracks: ActiveTracksDto;
}
