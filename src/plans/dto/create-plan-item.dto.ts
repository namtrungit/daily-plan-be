import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePlanItemDto {
    @IsUUID()
    dayPlanId!: string;

    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    timeText?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;
}