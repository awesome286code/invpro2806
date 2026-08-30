import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
    // Notifications
    @IsOptional()
    @IsBoolean()
    emailNotifications?: boolean;

    @IsOptional()
    @IsBoolean()
    pushNotifications?: boolean;

    @IsOptional()
    @IsBoolean()
    priceAlerts?: boolean;

    @IsOptional()
    @IsBoolean()
    portfolioUpdates?: boolean;

    @IsOptional()
    @IsBoolean()
    newsUpdates?: boolean;

    // Preferences
    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    theme?: string;

    @IsOptional()
    @IsString()
    timezone?: string;

    // Investment Profile
    @IsOptional()
    @IsString()
    riskTolerance?: string;

    @IsOptional()
    @IsString()
    investmentExperience?: string;

    @IsOptional()
    @IsString()
    investmentGoals?: string;

    // Privacy & Security
    @IsOptional()
    @IsBoolean()
    twoFactorEnabled?: boolean;

    @IsOptional()
    @IsBoolean()
    profilePublic?: boolean;
}
