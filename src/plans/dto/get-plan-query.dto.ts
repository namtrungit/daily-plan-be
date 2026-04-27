import { IsDateString} from 'class-validator';

export class GetPlanQueryDto {
  @IsDateString()
  date!: string;
}