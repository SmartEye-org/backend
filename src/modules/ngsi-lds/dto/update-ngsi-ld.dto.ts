import { PartialType } from '@nestjs/swagger';
import { CreateNgsiLdDto } from './create-ngsi-ld.dto';

export class UpdateNgsiLdDto extends PartialType(CreateNgsiLdDto) {}
