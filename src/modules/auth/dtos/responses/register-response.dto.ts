import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/modules/users/entities/user.entity';

export class RegisterResponseDto {
  @ApiProperty({ example: 'baced93e-ccdf-4d42-8e32-a83371b5c387' })
  id: string;

  @ApiProperty({ example: 'newuser@smarteye.vn' })
  email: string;

  @ApiProperty({ example: 'Jane Smith' })
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.VIEWER })
  role: UserRole;

  @ApiProperty({
    example: '2de9358d-36c1-4d4e-8a83-57b3383e331a',
    nullable: true,
  })
  building_id: string | null;

  @ApiProperty({ example: '2025-11-13T08:26:56.868Z' })
  created_at: Date;
}
