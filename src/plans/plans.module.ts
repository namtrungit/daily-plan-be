import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { SortPlanItemsResponseInterceptor } from './sort-plan-items-response.interceptor';
import { PrismaModule } from '../prisma/prisma.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [PrismaModule, DashboardModule],
  controllers: [PlansController],
  providers: [PlansService, SortPlanItemsResponseInterceptor],
})
export class PlansModule {}
