import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResidentStatus } from '../entities/resident.entity';

export class CreateResidentDto {
  @ApiProperty({ example: 'resident-001', description: 'Unique resident ID (e.g. resident-001)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  id: string;

  @ApiProperty({ example: 'Nguyễn Văn An' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'A1-101' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  apartment?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'nguyen.van.an@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ enum: ResidentStatus, default: ResidentStatus.ACTIVE })
  @IsEnum(ResidentStatus)
  @IsOptional()
  status?: ResidentStatus;

  @ApiProperty({ example: 'uuid-of-building' })
  @IsUUID()
  @IsNotEmpty()
  building_id: string;
}
