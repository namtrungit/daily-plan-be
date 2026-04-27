import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { GetPlanQueryDto } from './dto/get-plan-query.dto';
import { CreatePlanItemDto } from './dto/create-plan-item.dto';
import { UpdatePlanItemDto } from './dto/update-plan-item.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

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
