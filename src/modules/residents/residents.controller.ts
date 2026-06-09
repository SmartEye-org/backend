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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ResidentsService } from './residents.service';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('residents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('residents')
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new resident' })
  @ApiResponse({ status: 201, description: 'Resident created' })
  create(@Body() dto: CreateResidentDto) {
    return this.residentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List residents (optionally filter by building)' })
  @ApiQuery({ name: 'buildingId', required: false, type: String })
  findAll(@Query('buildingId') buildingId?: string) {
    return this.residentsService.findAll(buildingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resident by ID' })
  @ApiResponse({ status: 404, description: 'Resident not found' })
  findOne(@Param('id') id: string) {
    return this.residentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update resident info' })
  update(@Param('id') id: string, @Body() dto: UpdateResidentDto) {
    return this.residentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete resident' })
  remove(@Param('id') id: string) {
    return this.residentsService.remove(id);
  }

  /**
   * Enroll face: receive base64 embedding + optional photo URL.
   * In production this will be called by the AI service after ArcFace extraction.
   */
  @Post(':id/enroll-face')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Enroll face embedding for resident',
    description:
      'Stores the 512-dim ArcFace embedding. Call this after AI service extracts embedding from a resident photo.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        embedding: {
          type: 'array',
          items: { type: 'number' },
          description: '512-dimensional ArcFace embedding vector',
        },
        photo_url: { type: 'string', description: 'URL of the stored photo' },
      },
      required: ['embedding'],
    },
  })
  @ApiResponse({ status: 200, description: 'Face enrolled successfully' })
  async enrollFace(
    @Param('id') id: string,
    @Body() body: { embedding: number[]; photo_url?: string },
  ) {
    if (!Array.isArray(body.embedding) || body.embedding.length !== 512) {
      throw new BadRequestException(
        `Face embedding must be a 512-dimensional array, got ${body.embedding?.length}`,
      );
    }
    return this.residentsService.enrollFace(id, body.embedding, body.photo_url);
  }
}
