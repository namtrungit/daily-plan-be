import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { GetPlanQueryDto } from './dto/get-plan-query.dto';
import { GetPlansMonthQueryDto } from './dto/get-plans-month-query.dto';
import { GetPlansRangeQueryDto } from './dto/get-plans-range-query.dto';
import { CreatePlanItemDto } from './dto/create-plan-item.dto';
import { UpdatePlanItemDto } from './dto/update-plan-item.dto';
import { SortPlanItemsResponseInterceptor } from './sort-plan-items-response.interceptor';

@Controller('plans')
@UseInterceptors(SortPlanItemsResponseInterceptor)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  /** List day plans in a date range for the current user (no auto-create). */
  @Get('range')
  @UseGuards(JwtAuthGuard)
  getPlansInRange(
    @Query() query: GetPlansRangeQueryDto,
    @Req() req: any,
  ) {
    return this.plansService.getPlans(
      req.user.userId,
      query.start,
      query.end,
    );
  }

  /** List day plans for one calendar month (no auto-create). */
  @Get('month')
  @UseGuards(JwtAuthGuard)
  getPlansByMonth(@Query() query: GetPlansMonthQueryDto, @Req() req: any) {
    return this.plansService.getPlansByMonth(
      req.user.userId,
      query.year,
      query.month,
    );
  }

  /** Single day: find-or-create for the current user. */
  @Get()
  @UseGuards(JwtAuthGuard)
  getPlan(@Query() query: GetPlanQueryDto, @Req() req: any) {
    return this.plansService.getByDateForUser(req.user.userId, query.date);
  }

  @Post('items')
  @UseGuards(JwtAuthGuard)
  createItem(@Body() dto: CreatePlanItemDto, @Req() req: any) {
    return this.plansService.createItem(req.user.userId, dto);
  }

  @Patch('items/:id')
  @UseGuards(JwtAuthGuard)
  updateItem(
    @Param('id') id: string,
    @Body() dto: UpdatePlanItemDto,
    @Req() req: any,
  ) {
    return this.plansService.updateItem(req.user.userId, id, dto);
  }

	@Delete('items/:id')
	@UseGuards(JwtAuthGuard)
	deleteItem(@Param('id') id: string, @Req() req: any) {
		return this.plansService.deleteItem(req.user.userId, id);
	}
}
