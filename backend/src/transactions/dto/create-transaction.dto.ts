import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateTransactionDto {
    @IsOptional()
    @IsString()
    investmentId?: string;

    @IsEnum(['buy', 'sell', 'dividend', 'split', 'transfer', 'fee'])
    type: 'buy' | 'sell' | 'dividend' | 'split' | 'transfer' | 'fee';

    @IsNumber()
    @Min(0)
    amount: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    quantity?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    fees?: number;

    @IsOptional()
    @IsEnum(['pending', 'completed', 'failed', 'cancelled'])
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';

    @IsOptional()
    @IsDateString()
    transactionDate?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    symbol?: string;

    @IsOptional()
    @IsString()
    portfolioId?: string;

    @IsOptional()
    @IsString()
    assetName?: string;
}
