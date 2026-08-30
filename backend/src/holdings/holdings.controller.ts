import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { HoldingsService } from './holdings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('holdings')
@UseGuards(JwtAuthGuard)
export class HoldingsController {
    constructor(private readonly holdingsService: HoldingsService) { }

    @Get()
    async findAll(
        @Request() req,
        @Query('portfolioId') portfolioId?: string,
        @Query('type') type?: string
    ) {
        const filters = { portfolioId, type };
        return this.holdingsService.findAll(req.user.userId, filters);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        return this.holdingsService.findOne(id, req.user.userId);
    }

    @Patch(':id/price')
    async updatePrice(
        @Param('id') id: string,
        @Request() req,
        @Body('currentPrice') currentPrice: number
    ) {
        return this.holdingsService.updateCurrentPrice(id, req.user.userId, currentPrice);
    }

    @Get(':id/transactions')
    async getTransactions(@Param('id') id: string, @Request() req) {
        return this.holdingsService.getTransactions(id, req.user.userId);
    }

    @Get('symbol/:symbol')
    async getAssetDetailBySymbol(@Param('symbol') symbol: string, @Request() req) {
        return this.holdingsService.getAssetDetailBySymbol(symbol, req.user.userId);
    }
}
