import { Test, TestingModule } from '@nestjs/testing';
import { NgsiLdsService } from './ngsi-lds.service';

describe('NgsiLdsService', () => {
  let service: NgsiLdsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NgsiLdsService],
    }).compile();

    service = module.get<NgsiLdsService>(NgsiLdsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
