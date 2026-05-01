import { IsDateString } from 'class-validator';

export class GetPlansRangeQueryDto {
  @IsDateString()
  start!: string;

  @IsDateString()
  end!: string;
}
