import { Test, TestingModule } from '@nestjs/testing';
import { NgsiLdsController } from './ngsi-lds.controller';
import { NgsiLdsService } from './ngsi-lds.service';

describe('NgsiLdsController', () => {
  let controller: NgsiLdsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NgsiLdsController],
      providers: [NgsiLdsService],
    }).compile();

    controller = module.get<NgsiLdsController>(NgsiLdsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
