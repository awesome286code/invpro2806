import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('performance')
    async getPerformance(@Request() req, @Query('portfolioId') portfolioId?: string) {
        return this.reportsService.getPortfolioPerformance(req.user.userId, portfolioId);
    }

    @Get('allocation')
    async getAllocation(@Request() req) {
        return this.reportsService.getAllocation(req.user.userId);
    }
}
