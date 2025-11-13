import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { Roles } from './guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { LoginResponseDto } from './dtos/responses/login-response.dto';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { LogoutResponseDto } from './dtos/responses/logout-response.dto';
import { ProfileResponseDto } from './dtos/responses/profile-response.dto';
import { RegisterResponseDto } from './dtos/responses/register-response.dto';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    this.logger.log(`Login attempt: ${loginDto.email}`);
    const result = await this.authService.login(loginDto);

    return new ApiResponseDto(result, 'Login successful', HttpStatus.OK);
  }

  @Post('register')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register new user (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiResponseDto<RegisterResponseDto>> {
    const result = await this.authService.register(registerDto);

    return new ApiResponseDto(
      result,
      'User registered successfully',
      HttpStatus.CREATED,
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  async getProfile(
    @Request() req: RequestWithUser,
  ): Promise<ApiResponseDto<ProfileResponseDto>> {
    const profile = await this.authService.getProfile(req.user.id);

    return new ApiResponseDto(
      profile,
      'Profile retrieved successfully',
      HttpStatus.OK,
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout (invalidate token on client)' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: LogoutResponseDto,
  })
  logout(): ApiResponseDto<LogoutResponseDto> {
    // In JWT, logout is typically handled on client by removing token
    // Optionally implement token blacklist with Redis
    const data: LogoutResponseDto = {
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    };

    return new ApiResponseDto(data, 'Logout successful', HttpStatus.OK);
  }
}
