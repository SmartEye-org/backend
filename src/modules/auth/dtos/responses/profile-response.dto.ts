import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/modules/users/entities/user.entity';

export class ProfileResponseDto {
  @ApiProperty({ example: 'baced93e-ccdf-4d42-8e32-a83371b5c387' })
  id: string;

  @ApiProperty({ example: 'admin@smarteye.vn' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  role: UserRole;

  @ApiProperty({
    example: '2de9358d-36c1-4d4e-8a83-57b3383e331a',
    nullable: true,
  })
  building_id: string | null;

  @ApiProperty({ example: '2025-11-13T08:26:56.868Z' })
  created_at: Date;

  @ApiProperty({ example: '2025-11-13T08:26:56.868Z' })
  updated_at: Date;
}
