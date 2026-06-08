import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AcknowledgeViolationDto {
  @ApiPropertyOptional({ example: 'Đã điều phối bảo vệ đến kiểm tra' })
  @IsString()
  @IsOptional()
  actions_taken?: string;
}
