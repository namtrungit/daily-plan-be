import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanItemDto } from './dto/create-plan-item.dto';
import { UpdatePlanItemDto } from './dto/update-plan-item.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parses `YYYY-MM-DD` into a UTC calendar date (matches PostgreSQL `DATE` / Prisma `@db.Date`).
   */
  private parseDateOnlyUtc(isoDate: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
    if (!match) {
      throw new BadRequestException('date must be YYYY-MM-DD');
    }
    const y = Number.parseInt(match[1], 10);
    const m = Number.parseInt(match[2], 10);
    const d = Number.parseInt(match[3], 10);
    const parsed = new Date(Date.UTC(y, m - 1, d));
    if (
      parsed.getUTCFullYear() !== y ||
      parsed.getUTCMonth() !== m - 1 ||
      parsed.getUTCDate() !== d
    ) {
      throw new BadRequestException('invalid calendar date');
    }
    return parsed;
  }

  private async findPlansInInclusiveRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.prisma.dayPlan.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Lists existing day plans for the user whose calendar date is in [start, end] (inclusive).
   * `start` and `end` must be `YYYY-MM-DD`. Does not create missing days (unlike getByDateForUser).
   */
  async getPlans(userId: string, start: string, end: string) {
    const startDate = this.parseDateOnlyUtc(start);
    const endDate = this.parseDateOnlyUtc(end);
    if (startDate > endDate) {
      throw new BadRequestException('start must be on or before end');
    }

    return this.findPlansInInclusiveRange(userId, startDate, endDate);
  }

  /**
   * Lists day plans for a single calendar month (inclusive of first through last day).
   * Uses UTC month boundaries so results align with stored `DATE` values.
   */
  async getPlansByMonth(userId: string, year: number, month: number) {
    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      throw new BadRequestException('year and month must be integers');
    }
    if (month < 1 || month > 12) {
      throw new BadRequestException('month must be between 1 and 12');
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    return this.findPlansInInclusiveRange(userId, startDate, endDate);
  }

  async getByDateForUser(userId: string, date: string) {
    const parsedDate = new Date(date);
    const dayPlan = await this.prisma.dayPlan.findUnique({
      where: {
        userId_date: { userId, date: parsedDate },
      },
      include: {
        items: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
    if (!dayPlan) {
      const newDayPlan = await this.prisma.dayPlan.create({
        data: {
          userId,
          date: parsedDate,
        },
        include: {
          items: {
            orderBy: {
              position: 'asc',
            },
          },
        },
      });
      return newDayPlan;
    }
    return dayPlan;
  }

  async createItem(userId: string, dto: CreatePlanItemDto) {
    const dayPlan = await this.prisma.dayPlan.findUnique({
      where: {
        id: dto.dayPlanId,
      },
    });

    if (!dayPlan) throw new NotFoundException('Day plan not found');
    if (dayPlan.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to create items for this day plan',
      );
    }

    return this.prisma.planItem.create({
      data: {
        dayPlanId: dto.dayPlanId,
        title: dto.title,
        timeText: dto.timeText,
        notes: dto.notes,
        position: dto.position ?? 0,
      },
    });
  }

  async updateItem(userId: string, itemId: string, dto: UpdatePlanItemDto) {
    const item = await this.prisma.planItem.findUnique({
      where: {
        id: itemId,
      },
			include: {
				dayPlan: true,
			},
    });

    if (!item) throw new NotFoundException('Item not found');
    if (item.dayPlan.userId !== userId)
      throw new ForbiddenException('You are not allowed to update this item');

		return this.prisma.planItem.update({
			where: {
				id: itemId,
			},
			data: {
				...dto,
			},
		});
  }

	async deleteItem(userId:string, itemId:string) {
		const item = await this.prisma.planItem.findUnique({
			where: { id: itemId },
			include: {
				dayPlan: true,
			},
		})

		if(!item) throw new NotFoundException('Item not found');
		if(item.dayPlan.userId !== userId) throw new ForbiddenException('You are not allowed to delete this item');

		return this.prisma.planItem.delete({
			where: { id: itemId },
		});
	}
}
