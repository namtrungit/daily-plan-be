import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private async buildTodaySummary(userId: string, todayDate: Date) {
    const todayPlan = await this.prisma.dayPlan.findUnique({
      where: { userId_date: { userId, date: todayDate } },
      include: { items: true },
    });

    const total = todayPlan?.items.length ?? 0;
    const done = todayPlan?.items.filter((i) => i.done).length ?? 0;
    const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);

    return { total, done, completionRate };
  }

  private async getOverdueCount(userId: string, todayDate: Date) {
    return this.prisma.planItem.count({
      where: {
        done: false,
        dayPlan: {
          userId,
          date: {
            lt: todayDate,
          },
        },
      },
    });
  }

  private buildTrendDates(todayDate: Date, range: '7d' | '30d') {
    const days = range === '30d' ? 30 : 7;
    const trendDates: string[] = [];

    for (let i = days - 1; i >= 0; i--) {
      trendDates.push(this.toYmdUtc(this.addDaysUtc(todayDate, -i)));
    }

    return trendDates;
  }

  private async buildTrend(userId: string, trendDates: string[]) {
    const trend: { date: string; doneCount: number }[] = [];

    for (const ymd of trendDates) {
      const day = this.parseDateOnlyUtc(ymd);
      const doneCount = await this.prisma.planItem.count({
        where: {
          done: true,
          dayPlan: {
            userId,
            date: day,
          },
        },
      });
      trend.push({ date: ymd, doneCount });
    }

    return trend;
  }

  private async buildStreak(userId: string, todayDate: Date) {
    let streakDays = 0;

    for (let offset = 1; offset <= 365; offset++) {
      const day = this.addDaysUtc(todayDate, -offset);
      const doneCount = await this.prisma.planItem.count({
        where: {
          done: true,
          dayPlan: {
            userId,
            date: day,
          },
        },
      });

      if (doneCount > 0) {
        streakDays = offset;
      } else {
        break;
      }
    }

    return streakDays;
  }

	private toYmdUtc(date: Date): string {
		return date.toISOString().slice(0, 10);
	}

	private parseDateOnlyUtc(ymd: string): Date {
		const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
		if(!match) {
			throw new Error('Invalid YYYY-MM-DD');
		}
		const y = Number(match[1]);
		const m = Number(match[2]);
		const d = Number(match[3]);
		return new Date(Date.UTC(y, m - 1, d));
	}

	private addDaysUtc(date: Date, days: number): Date {
		const next = new Date(date);
		next.setUTCDate(next.getUTCDate() + days);
		return next;
	}
	
  async getSummary(userId: string, range: '7d' | '30d' = '7d') {
		const todayYmd = this.toYmdUtc(new Date());
		const todayDate = this.parseDateOnlyUtc(todayYmd);
		const today = await this.buildTodaySummary(userId, todayDate);
		const overdueCount = await this.getOverdueCount(userId, todayDate);
		const trendDates = this.buildTrendDates(todayDate, range);
		const trend = await this.buildTrend(userId, trendDates);
		const streakDays = await this.buildStreak(userId, todayDate);
    return {
      today,
      overdue: { count: overdueCount },
      trend: trend,
      streak: { days: streakDays },
      meta: { range, userId, todayYmd },
    };
  }
}
