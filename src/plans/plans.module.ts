import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  controllers: [PlansController],
  providers: [PlansService],
  imports: [PrismaModule],
})
export class PlansModule {}
