import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessImageDto {
  @ApiProperty({
    description: 'Camera ID',
    example: 'camera-01',
    default: 'camera-01',
  })
  @IsString()
  @IsOptional()
  camera_id?: string = 'camera-01';

  @ApiPropertyOptional({
    description: 'Location description',
    example: 'Building A - Floor 3',
  })
  @IsString()
  @IsOptional()
  location?: string;
}
