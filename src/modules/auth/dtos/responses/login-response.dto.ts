import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  token_type: string;

  @ApiProperty()
  expires_in: number;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    building?: {
      id: string;
      name: string;
      code: string;
    };
  };
}
