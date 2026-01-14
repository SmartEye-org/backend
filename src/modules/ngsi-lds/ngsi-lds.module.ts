import { Module } from '@nestjs/common';
import { NgsiLdsService } from './ngsi-lds.service';
import { NgsiLdsController } from './ngsi-lds.controller';

@Module({
  controllers: [NgsiLdsController],
  providers: [NgsiLdsService],
})
export class NgsiLdsModule {}
