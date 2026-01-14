import {
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DetectionsService } from './detections.service';
import { ProcessImageDto } from './dto/process-image.dto';
import { GetDetectionsDto } from './dto/get-detections.dto';
import { GetEventsDto } from './dto/get-events.dto';
import { GetEventsResponseDto } from './dto/response/event-item-response.dto';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { GetDetectionsResponseDto } from './dto/response/get-detection-response.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';

@ApiTags('detections')
@ApiBearerAuth()
@Controller('detections')
export class DetectionsController {
  constructor(private readonly detectionsService: DetectionsService) {}

  @Post('process')
  @ApiOperation({
    summary: 'Process image for person detection',
    description:
      'Upload an image to detect persons, track movements, and identify residents',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG)',
        },
        camera_id: {
          type: 'string',
          default: 'camera-01',
          description: 'Camera identifier',
        },
        location: {
          type: 'string',
          description: 'Location description (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Detection results',
    type: ProcessImageDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UseInterceptors(FileInterceptor('image'))
  async processImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query() dto: ProcessImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const result = await this.detectionsService.processImage(
      file.buffer,
      file.originalname,
      dto.camera_id,
      dto.location,
    );

    return new ApiResponseDto(result, 'Image processed successfully', 200);
  }

  @Get()
  @ApiOperation({
    summary: 'Get recent detections',
    description: 'Retrieve recent detection records with optional limit',
  })
  @ApiResponse({
    status: 200,
    description: 'List of recent detections',
    type: GetDetectionsResponseDto,
  })
  async getRecentDetections(@Query() dto: GetDetectionsDto) {
    const result = await this.detectionsService.getRecentDetections(dto.limit);

    return new ApiResponseDto(result, 'Detections retrieved successfully', 200);
  }

  @Get('events')
  @ApiOperation({
    summary: 'Get recent events',
    description:
      'Retrieve recent detection events with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of recent events',
    type: GetEventsResponseDto,
  })
  async getRecentEvents(@Query() params: GetEventsDto) {
    const result = await this.detectionsService.getRecentEvents({
      limit: params.limit,
      offset: params.offset,
      camera_id: params.camera_id,
      person_type: params.person_type,
      start_date: params.start_date,
      end_date: params.end_date,
    });

    return new PaginatedResponseDto(
      result.events,
      result.total,
      result.page,
      params.limit || 50,
      'Events retrieved successfully',
    );
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get detection statistics',
    description: 'Get summary statistics of detections',
  })
  @ApiResponse({ status: 200, description: 'Detection statistics' })
  getStats() {
    const data = {
      message: 'Statistics endpoint - to be implemented',
    };

    return new ApiResponseDto(data, 'Statistics retrieved successfully', 200);
  }
}
