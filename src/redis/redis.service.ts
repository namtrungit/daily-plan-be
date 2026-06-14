import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import Redis from 'ioredis';
  
  @Injectable()
  export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;
  
    constructor(private readonly configService: ConfigService) {
      const url = this.configService.get<string>('REDIS_URL');
      if (!url) {
        throw new Error('REDIS_URL is not set');
      }
      this.client = new Redis(url);
    }
  
    async onModuleInit() {
      await this.client.ping();
    }
  
    async onModuleDestroy() {
      await this.client.quit();
    }
  
    async get(key: string): Promise<string | null> {
      return this.client.get(key);
    }
  
    async set(key: string, value: string, ttlSeconds: number): Promise<void> {
      await this.client.set(key, value, 'EX', ttlSeconds);
    }
  
    async del(...keys: string[]): Promise<void> {
      if (keys.length === 0) return;
      await this.client.del(...keys);
    }
  }