import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { DashboardResponseDto } from './dto/response/dashboard-response.dto';

@ApiTags('statistics')
@ApiBearerAuth()
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description:
      'Retrieve overall dashboard statistics including detections, cameras, violations, and active tracks',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics',
    type: DashboardResponseDto,
  })
  async getDashboard() {
    const data = await this.statisticsService.getDashboardStats();

    return new ApiResponseDto(
      data,
      'Dashboard statistics retrieved successfully',
      200,
    );
  }
}
