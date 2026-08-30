import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreatePortfolioDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(['active', 'archived'])
    status?: 'active' | 'archived';

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsString()
    icon?: string;
}
