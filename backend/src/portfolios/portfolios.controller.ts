import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('portfolios')
@UseGuards(JwtAuthGuard)
export class PortfoliosController {
    constructor(private readonly portfoliosService: PortfoliosService) { }

    @Post()
    create(@Request() req, @Body() createPortfolioDto: CreatePortfolioDto) {
        return this.portfoliosService.create(req.user.id, createPortfolioDto);
    }

    @Get()
    findAll(@Request() req) {
        console.log('Fetching portfolios for user:', req.user.id);
        return this.portfoliosService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.portfoliosService.findOne(id, req.user.id);
    }

    @Get(':id/holdings')
    getHoldings(@Request() req, @Param('id') id: string) {
        return this.portfoliosService.getHoldings(id, req.user.id);
    }

    @Get(':id/analytics')
    getAnalytics(@Request() req, @Param('id') id: string) {
        return this.portfoliosService.getPortfolioAnalytics(id, req.user.id);
    }

    @Get(':id/allocation')
    getAllocation(@Request() req, @Param('id') id: string) {
        return this.portfoliosService.getAssetAllocation(id, req.user.id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updatePortfolioDto: UpdatePortfolioDto) {
        return this.portfoliosService.update(id, req.user.id, updatePortfolioDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.portfoliosService.remove(id, req.user.id);
    }
}
