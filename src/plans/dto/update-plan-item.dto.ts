import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePlanItemDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    timeText?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsBoolean()
    done?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;
}