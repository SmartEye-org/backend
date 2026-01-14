import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole } from 'src/modules/users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'admin@vinhomes.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: '+84901234567', required: false })
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.VIEWER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ example: 'building-uuid', required: false })
  @IsOptional()
  building_id?: string;
}
