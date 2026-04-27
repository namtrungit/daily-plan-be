import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
					}
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
}
