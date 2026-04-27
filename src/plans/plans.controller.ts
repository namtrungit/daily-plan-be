import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { GetPlanQueryDto } from './dto/get-plan-query.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	getPlan(@Query() query: GetPlanQueryDto, @Req() req: any) {
		return this.plansService.getByDateForUser(req.user.userId, query.date);
	}
}
