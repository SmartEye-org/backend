import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsObject,
  IsNumber,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BuildingStatus } from '../entities/building.entity';

export class CreateBuildingDto {
  @ApiProperty({ example: 'Vinhomes Central Park' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'VCP', description: 'Short unique code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiPropertyOptional({ example: '208 Nguyễn Hữu Cảnh, Bình Thạnh' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Hồ Chí Minh' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: { lat: 10.7769, lng: 106.7009 } })
  @IsObject()
  @IsOptional()
  location?: { lat: number; lng: number };

  @ApiPropertyOptional({ example: 'contact@vinhomes.vn' })
  @IsEmail()
  @IsOptional()
  contact_email?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsString()
  @IsOptional()
  contact_phone?: string;

  @ApiPropertyOptional({ enum: BuildingStatus, default: BuildingStatus.TRIAL })
  @IsEnum(BuildingStatus)
  @IsOptional()
  status?: BuildingStatus;

  @ApiPropertyOptional({ example: '2027-01-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  subscription_expires_at?: string;
}
