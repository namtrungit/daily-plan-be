import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { SortPlanItemsResponseInterceptor } from './sort-plan-items-response.interceptor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [PlansController],
  providers: [PlansService, SortPlanItemsResponseInterceptor],
  imports: [PrismaModule],
})
export class PlansModule {}
