import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import type {
  DashboardRange,
  DashboardSummary,
} from './dashboard-summary.types';

@Injectable()
export class DashboardCacheService {
  private readonly ttlSeconds: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    const raw = this.configService.get<string>(
      'DASHBOARD_CACHE_TTL_SECONDS',
      '300',
    );
    const parsed = Number.parseInt(raw, 10);
    this.ttlSeconds = Number.isFinite(parsed) && parsed > 0 ? parsed : 300;
  }

  private buildKey(userId: string, range: DashboardRange): string {
    return `dashboard:summary:${userId}:${range}`;
  }

  async get(
    userId: string,
    range: DashboardRange,
  ): Promise<DashboardSummary | null> {
    const raw = await this.redisService.get(this.buildKey(userId, range));
    if (!raw) return null;

    try {
      return JSON.parse(raw) as DashboardSummary;
    } catch {
      await this.redisService.del(this.buildKey(userId, range));
      return null;
    }
  }

  async set(
    userId: string,
    range: DashboardRange,
    summary: DashboardSummary,
  ): Promise<void> {
    await this.redisService.set(
      this.buildKey(userId, range),
      JSON.stringify(summary),
      this.ttlSeconds,
    );
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.redisService.del(
      this.buildKey(userId, '7d'),
      this.buildKey(userId, '30d'),
    );
  }
}
