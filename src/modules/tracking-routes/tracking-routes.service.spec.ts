import { Test, TestingModule } from '@nestjs/testing';
import { TrackingRoutesService } from './tracking-routes.service';

describe('TrackingRoutesService', () => {
  let service: TrackingRoutesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingRoutesService],
    }).compile();

    service = module.get<TrackingRoutesService>(TrackingRoutesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
