import { IsIn, IsOptional } from 'class-validator';

export class GetDashboardSummaryQueryDto {
  @IsIn(['7d', '30d'])
  @IsOptional()
  range?:  '7d' | '30d';
}