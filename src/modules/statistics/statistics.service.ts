import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Camera } from 'src/modules/cameras/entities/camera.entity';
import { Detection } from 'src/modules/detections/entities/detection.entity';
import { Violation } from 'src/modules/violations/entities/violation.entity';
import { Between, Repository } from 'typeorm';

// --- RAW RESULT INTERFACES ---
interface TodayDetectionsRaw {
  total: string;
  residents: string;
  guests: string;
  unknown: string;
}

interface CameraStatsRaw {
  total: string;
  online: string;
  offline: string;
}

interface ViolationStatsRaw {
  total: string;
  critical: string;
  high: string;
  medium: string;
  low: string;
  unresolved: string;
}

interface ActiveTracksRaw {
  total: string;
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Detection)
    private detectionRepo: Repository<Detection>,
    @InjectRepository(Camera)
    private cameraRepo: Repository<Camera>,
    @InjectRepository(Violation)
    private violationRepo: Repository<Violation>,
  ) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Today detections
    const todayDetections = (await this.detectionRepo
      .createQueryBuilder('d')
      .select('COUNT(*)', 'total')
      .addSelect(
        "COUNT(CASE WHEN person_type = 'resident' THEN 1 END)",
        'residents',
      )
      .addSelect("COUNT(CASE WHEN person_type = 'guest' THEN 1 END)", 'guests')
      .addSelect(
        "COUNT(CASE WHEN person_type = 'unknown' THEN 1 END)",
        'unknown',
      )
      .where('timestamp >= :today', { today })
      .getRawOne()) as TodayDetectionsRaw;

    const yesterdayDetections = await this.detectionRepo.count({
      where: {
        timestamp: Between(yesterday, today),
      },
    });

    const changePercent = yesterdayDetections
      ? ((parseInt(todayDetections.total) - yesterdayDetections) /
          yesterdayDetections) *
        100
      : 0;

    // Camera status
    const cameras = (await this.cameraRepo
      .createQueryBuilder('c')
      .select('COUNT(*)', 'total')
      .addSelect("COUNT(CASE WHEN status = 'online' THEN 1 END)", 'online')
      .addSelect("COUNT(CASE WHEN status = 'offline' THEN 1 END)", 'offline')
      .getRawOne()) as CameraStatsRaw;

    // Violations today
    const violations = (await this.violationRepo
      .createQueryBuilder('v')
      .select('COUNT(*)', 'total')
      .addSelect(
        "COUNT(CASE WHEN severity = 'critical' THEN 1 END)",
        'critical',
      )
      .addSelect("COUNT(CASE WHEN severity = 'high' THEN 1 END)", 'high')
      .addSelect("COUNT(CASE WHEN severity = 'medium' THEN 1 END)", 'medium')
      .addSelect("COUNT(CASE WHEN severity = 'low' THEN 1 END)", 'low')
      .addSelect('COUNT(CASE WHEN resolved = false THEN 1 END)', 'unresolved')
      .where('timestamp >= :today', { today })
      .getRawOne()) as ViolationStatsRaw;

    const activeTracks = (await this.detectionRepo
      .createQueryBuilder('d')
      .select('COUNT(DISTINCT track_id)', 'total')
      .where('timestamp >= :fifteenMinutesAgo', {
        fifteenMinutesAgo: new Date(Date.now() - 15 * 60 * 1000),
      })
      .getRawOne()) as ActiveTracksRaw;

    return {
      today_detections: {
        total: parseInt(todayDetections.total),
        change_percent: Math.round(changePercent * 10) / 10,
        breakdown: {
          residents: parseInt(todayDetections.residents),
          guests: parseInt(todayDetections.guests),
          unknown: parseInt(todayDetections.unknown),
        },
      },
      active_cameras: {
        online: parseInt(cameras.online),
        total: parseInt(cameras.total),
        offline: parseInt(cameras.offline),
      },
      violations_today: {
        total: parseInt(violations.total),
        by_severity: {
          critical: parseInt(violations.critical),
          high: parseInt(violations.high),
          medium: parseInt(violations.medium),
          low: parseInt(violations.low),
        },
        unresolved: parseInt(violations.unresolved),
      },
      active_tracks: {
        total: parseInt(activeTracks.total),
      },
    };
  }
}
