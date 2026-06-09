import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  ViolationsService,
  ViolationFilter,
} from './violations.service';
import { CreateViolationDto } from './dto/create-violation.dto';
import { AcknowledgeViolationDto } from './dto/acknowledge-violation.dto';
import { ViolationType, ViolationSeverity } from './entities/violation.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('violations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('violations')
export class ViolationsController {
  constructor(private readonly violationsService: ViolationsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a violation (internal/AI service use)' })
  @ApiResponse({ status: 201, description: 'Violation created' })
  create(@Body() dto: CreateViolationDto) {
    return this.violationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List violations with filters' })
  @ApiQuery({ name: 'camera_id', required: false })
  @ApiQuery({ name: 'violation_type', required: false, enum: ViolationType })
  @ApiQuery({ name: 'severity', required: false, enum: ViolationSeverity })
  @ApiQuery({ name: 'resolved', required: false, type: Boolean })
  @ApiQuery({ name: 'acknowledged', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(
    @Query('camera_id') camera_id?: string,
    @Query('violation_type') violation_type?: ViolationType,
    @Query('severity') severity?: ViolationSeverity,
    @Query('resolved') resolved?: string,
    @Query('acknowledged') acknowledged?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filter: ViolationFilter = {
      camera_id,
      violation_type,
      severity,
      resolved: resolved !== undefined ? resolved === 'true' : undefined,
      acknowledged: acknowledged !== undefined ? acknowledged === 'true' : undefined,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    };
    return this.violationsService.findAll(filter);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get violation statistics for dashboard' })
  getStats(@Query('cameraIds') cameraIds?: string) {
    const ids = cameraIds ? cameraIds.split(',') : undefined;
    return this.violationsService.getStats(ids);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get violation by ID' })
  @ApiResponse({ status: 404, description: 'Violation not found' })
  findOne(@Param('id') id: string) {
    return this.violationsService.findOne(id);
  }

  @Patch(':id/acknowledge')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.SECURITY)
  @ApiOperation({ summary: 'Acknowledge a violation (mark as seen + actions taken)' })
  acknowledge(
    @Param('id') id: string,
    @Body() dto: AcknowledgeViolationDto,
    @Request() req: any,
  ) {
    return this.violationsService.acknowledge(id, req.user.id, dto);
  }

  @Patch(':id/resolve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Resolve a violation (mark as fully handled)' })
  resolve(@Param('id') id: string, @Request() req: any) {
    return this.violationsService.resolve(id, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete violation (SUPER_ADMIN only)' })
  remove(@Param('id') id: string) {
    return this.violationsService.remove(id);
  }
}
