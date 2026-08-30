import { Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SnapshotService } from './snapshot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(
        private readonly analyticsService: AnalyticsService,
        private readonly snapshotService: SnapshotService
    ) { }

    @Get('portfolio')
    getPortfolioAnalytics(@Request() req) {
        return this.analyticsService.getPortfolioAnalytics(req.user.id);
    }

    @Get('performance')
    getPerformanceMetrics(@Request() req) {
        return this.analyticsService.getPerformanceMetrics(req.user.id);
    }

    @Get('allocation')
    getAssetAllocation(@Request() req) {
        return this.analyticsService.getAssetAllocation(req.user.id);
    }

    @Get('risk-distribution')
    getRiskDistribution(@Request() req) {
        return this.analyticsService.getRiskDistribution(req.user.id);
    }

    @Post('snapshots/run')
    async runSnapshots() {
        await this.snapshotService.runManualSnapshot();
        return { message: 'Snapshots captured successfully' };
    }

    @Get('history')
    getHistoricalData(@Request() req, @Query('days') days?: string) {
        const numDays = days ? parseInt(days, 10) : 30;
        return this.analyticsService.getHistoricalData(req.user.id, numDays);
    }
}
