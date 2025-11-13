import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logout successful' })
  message: string;

  @ApiProperty({ example: '2025-11-13T08:26:56.868Z' })
  timestamp: string;
}
