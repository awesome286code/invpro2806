import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Asset } from '../entities/asset.entity';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Get()
    async findAll(): Promise<Asset[]> {
        return await this.assetsService.findAll();
    }

    @Get('by-type/:type')
    async findByType(
        @Param('type') type: string,
        @Query('currency') currency?: string
    ): Promise<Asset[]> {
        if (currency) {
            return await this.assetsService.findByTypeAndCurrency(type, currency);
        }
        return await this.assetsService.findByType(type);
    }

    @Get('symbol/:symbol')
    async findBySymbol(@Param('symbol') symbol: string): Promise<Asset | null> {
        return await this.assetsService.findBySymbol(symbol);
    }

    @Post()
    async create(@Body() assetData: Partial<Asset>): Promise<Asset> {
        return await this.assetsService.create(assetData);
    }
}
