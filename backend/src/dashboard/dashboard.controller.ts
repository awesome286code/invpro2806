import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('summary')
    async getSummary(@Request() req) {
        return this.dashboardService.getSummary(req.user.userId);
    }

    @Get('performance')
    async getPerformance(
        @Request() req,
        @Query('timeRange') timeRange?: string
    ) {
        return this.dashboardService.getPerformance(req.user.userId, timeRange);
    }

    @Get('top-performers')
    async getTopPerformers(
        @Request() req,
        @Query('limit') limit?: string
    ) {
        const limitNum = limit ? parseInt(limit, 10) : 5;
        return this.dashboardService.getTopPerformers(req.user.userId, limitNum);
    }

    @Get('recent-activity')
    async getRecentActivity(
        @Request() req,
        @Query('limit') limit?: string
    ) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.dashboardService.getRecentActivity(req.user.userId, limitNum);
    }
}
