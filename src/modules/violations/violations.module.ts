import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViolationsService } from './violations.service';
import { ViolationsController } from './violations.controller';
import { Violation } from './entities/violation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Violation])],
  controllers: [ViolationsController],
  providers: [ViolationsService],
  exports: [ViolationsService],
})
export class ViolationsModule {}
