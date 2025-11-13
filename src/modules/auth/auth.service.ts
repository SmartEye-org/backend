import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt.strategy';
import {
  Building,
  BuildingStatus,
} from '../buildings/entities/building.entity';
import { User, UserStatus } from '../users/entities/user.entity';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { LoginResponseDto } from './dtos/responses/login-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    private jwtService: JwtService,
  ) {}

  /**
   * Login with email and password
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Find user with building relation
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['building'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Check building subscription (if applicable)
    if (user.building && user.building.status !== BuildingStatus.ACTIVE) {
      throw new UnauthorizedException('Building subscription has expired');
    }

    // Update last login
    await this.userRepository.update(user.id, {
      last_login_at: new Date(),
    });

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      building_id: user.building_id,
    };

    const access_token = this.jwtService.sign(payload);

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 3600, // 1 hour
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        building: user.building
          ? {
              id: user.building.id,
              name: user.building.name,
              code: user.building.code,
            }
          : undefined,
      },
    };
  }

  /**
   * Register new user (admin only)
   */
  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, building_id, ...userData } = registerDto;

    // Check if email exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Validate building if provided
    if (building_id) {
      const building = await this.buildingRepository.findOne({
        where: { id: building_id },
      });
      if (!building) {
        throw new ConflictException('Building not found');
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      building_id,
      ...userData,
    });

    const savedUser = await this.userRepository.save(user);

    this.logger.log(`New user registered: ${email}`);

    return savedUser;
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['building'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Validate user by ID (used by JWT strategy)
   */
  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['building'],
    });
  }
}
