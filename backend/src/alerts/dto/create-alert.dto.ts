import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateAlertDto {
    @IsString()
    symbol: string;

    @IsEnum(['price_above', 'price_below', 'percent_change', 'volume'])
    type: 'price_above' | 'price_below' | 'percent_change' | 'volume';

    @IsNumber()
    @Min(0)
    targetValue: number;

    @IsOptional()
    @IsEnum(['active', 'triggered', 'expired', 'disabled'])
    status?: 'active' | 'triggered' | 'expired' | 'disabled';

    @IsOptional()
    @IsDateString()
    expiresAt?: string;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsBoolean()
    notifyEmail?: boolean;

    @IsOptional()
    @IsBoolean()
    notifyPush?: boolean;
}
