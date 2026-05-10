import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { GetDashboardSummaryQueryDto } from './dto/get-dashboard-summary-query.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

	@Get('summary')
	@UseGuards(JwtAuthGuard)
	getSummary(@Query() query: GetDashboardSummaryQueryDto, @Req() req: any) {
		const range = query.range ?? '7d';
		return this.dashboardService.getSummary(req.user.userId, range);
	}
}
