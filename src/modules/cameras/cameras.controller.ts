import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';
import { StartStreamDto } from './dto/start-stream.dto';
import { StreamingService } from './services/streaming.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { CamerasService } from './services/cameras.service';
import { StreamStatusDto } from './dto/response/stream-status-response';

@ApiTags('cameras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cameras')
export class CamerasController {
  constructor(
    private readonly camerasService: CamerasService,
    private readonly streamingService: StreamingService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new camera' })
  @ApiResponse({ status: 201, description: 'Camera created successfully' })
  create(@Body() createCameraDto: CreateCameraDto) {
    return this.camerasService.create(createCameraDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cameras' })
  @ApiResponse({ status: 200, description: 'List of cameras' })
  findAll() {
    return this.camerasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get camera by ID' })
  @ApiResponse({ status: 200, description: 'Camera details' })
  @ApiResponse({ status: 404, description: 'Camera not found' })
  findOne(@Param('id') id: string) {
    return this.camerasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update camera' })
  @ApiResponse({ status: 200, description: 'Camera updated successfully' })
  update(@Param('id') id: string, @Body() updateCameraDto: UpdateCameraDto) {
    return this.camerasService.update(id, updateCameraDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete camera' })
  @ApiResponse({ status: 200, description: 'Camera deleted successfully' })
  remove(@Param('id') id: string) {
    return this.camerasService.remove(id);
  }

  @Post(':id/start-stream')
  @ApiOperation({ summary: 'Start camera streaming' })
  @ApiResponse({
    status: 200,
    description: 'Stream started successfully',
  })
  @ApiResponse({ status: 404, description: 'Camera not found' })
  async startStream(@Param('id') id: string, @Body() dto: StartStreamDto) {
    const camera = await this.streamingService.startStream(id, dto.fps);

    return new ApiResponseDto(
      {
        camera_id: camera.id,
        camera_name: camera.name,
        is_streaming: camera.is_streaming,
        status: camera.status,
        stream_config: camera.stream_config,
      },
      'Stream started successfully',
    );
  }

  @Post(':id/stop-stream')
  @ApiOperation({ summary: 'Stop camera streaming' })
  @ApiResponse({
    status: 200,
    description: 'Stream stopped successfully',
  })
  @ApiResponse({ status: 404, description: 'Camera not found' })
  async stopStream(@Param('id') id: string) {
    const camera = await this.streamingService.stopStream(id);

    return new ApiResponseDto(
      {
        camera_id: camera.id,
        camera_name: camera.name,
        is_streaming: camera.is_streaming,
        status: camera.status,
      },
      'Stream stopped successfully',
    );
  }

  @Get(':id/stream-status')
  @ApiOperation({ summary: 'Get camera stream status' })
  @ApiResponse({
    status: 200,
    description: 'Stream status retrieved',
    type: StreamStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Camera not found' })
  async getStreamStatus(@Param('id') id: string) {
    const camera = await this.camerasService.findOne(id);
    const streamInstance = this.streamingService.getStreamStatus(id);

    const statusData: StreamStatusDto = {
      camera_id: camera.id,
      camera_name: camera.name,
      status: camera.status,
      is_streaming: camera.is_streaming,
      stream_type: camera.stream_type,
      last_frame_at: camera.last_frame_at,
      frame_count: camera.frame_count,
      stream_config: camera.stream_config,
    };

    return new ApiResponseDto(
      {
        ...statusData,
        stream_instance: streamInstance
          ? {
              started_at: streamInstance.startedAt,
              frames_processed: streamInstance.frameCount,
              is_active: streamInstance.isActive,
            }
          : null,
      },
      'Stream status retrieved',
    );
  }

  @Get('active-streams/list')
  @ApiOperation({ summary: 'Get all active streams' })
  @ApiResponse({
    status: 200,
    description: 'Active streams list',
  })
  async getActiveStreams() {
    const streams = this.streamingService.getActiveStreams();

    const streamData = await Promise.all(
      streams.map(async (stream) => {
        const camera = await this.camerasService.findOne(stream.cameraId);
        return {
          camera_id: camera.id,
          camera_name: camera.name,
          location: camera.location,
          started_at: stream.startedAt,
          frames_processed: stream.frameCount,
          is_active: stream.isActive,
          last_frame_at: camera.last_frame_at,
        };
      }),
    );

    return new ApiResponseDto(
      {
        total: streams.length,
        streams: streamData,
      },
      'Active streams retrieved',
    );
  }
}
