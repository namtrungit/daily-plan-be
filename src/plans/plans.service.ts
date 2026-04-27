import {
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
