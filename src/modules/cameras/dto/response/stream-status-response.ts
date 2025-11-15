import { ApiProperty } from '@nestjs/swagger';
import { CameraStatus, StreamType } from '../../entities/camera.entity';

export class StreamStatusDto {
  @ApiProperty()
  camera_id: string;

  @ApiProperty()
  camera_name: string;

  @ApiProperty({ enum: CameraStatus })
  status: CameraStatus;

  @ApiProperty()
  is_streaming: boolean;

  @ApiProperty({ enum: StreamType })
  stream_type: StreamType;

  @ApiProperty({ nullable: true })
  last_frame_at: Date | null;

  @ApiProperty()
  frame_count: number;

  @ApiProperty({ nullable: true })
  stream_config: {
    fps?: number;
    resolution?: string;
    codec?: string;
    buffer_size?: number;
  } | null;
}
