import { Test, TestingModule } from '@nestjs/testing';
import { TrackingRoutesController } from './tracking-routes.controller';
import { TrackingRoutesService } from './tracking-routes.service';

describe('TrackingRoutesController', () => {
  let controller: TrackingRoutesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackingRoutesController],
      providers: [TrackingRoutesService],
    }).compile();

    controller = module.get<TrackingRoutesController>(TrackingRoutesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
