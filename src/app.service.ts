import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  environment?: string;
  services?: {
    ai_service: {
      url?: string;
      status: string;
    };
  };
}

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHealth(): HealthResponse {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: this.configService.get<string>('app.version') || '1.0',
      environment: this.configService.get<string>('nodeEnv'),
    };
  }

  getDetailedHealth(): HealthResponse {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: this.configService.get<string>('app.version') || '1.0',
      environment: this.configService.get<string>('nodeEnv'),
      services: {
        ai_service: {
          url: this.configService.get<string>('aiService.url'),
          status: 'unknown', // Will check in detections module
        },
      },
    };
  }
}
