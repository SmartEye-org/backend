import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('buildings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new building' })
  @ApiResponse({ status: 201, description: 'Building created successfully' })
  @ApiResponse({ status: 409, description: 'Building name or code already exists' })
  create(@Body() dto: CreateBuildingDto) {
    return this.buildingsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all buildings' })
  @ApiResponse({ status: 200, description: 'List of buildings' })
  findAll() {
    return this.buildingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get building by ID (with cameras & residents)' })
  @ApiResponse({ status: 200, description: 'Building details' })
  @ApiResponse({ status: 404, description: 'Building not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.buildingsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update building' })
  @ApiResponse({ status: 200, description: 'Building updated' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBuildingDto,
  ) {
    return this.buildingsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete building (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Building deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.buildingsService.remove(id);
  }
}
