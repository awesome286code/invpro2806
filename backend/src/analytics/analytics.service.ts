import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Investment } from '../entities/investment.entity';
import { Transaction } from '../entities/transaction.entity';
import { Portfolio } from '../entities/portfolio.entity';
import { PortfolioSnapshot } from '../entities/portfolio-snapshot.entity';
import { CashFlowSnapshot } from '../entities/cashflow-snapshot.entity';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(Investment)
        private investmentsRepository: Repository<Investment>,
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(Portfolio)
        private portfoliosRepository: Repository<Portfolio>,
        @InjectRepository(PortfolioSnapshot)
        private portfolioSnapshotsRepository: Repository<PortfolioSnapshot>,
        @InjectRepository(CashFlowSnapshot)
        private cashFlowSnapshotsRepository: Repository<CashFlowSnapshot>,
    ) { }

    async getPortfolioAnalytics(userId: string): Promise<any> {
        const investments = await this.investmentsRepository.find({
            where: { userId },
            relations: ['asset'],
        });

        const totalValue = investments.reduce((sum, inv) => {
            const currentPrice = Number(inv.asset?.currentPrice || inv.averagePrice);
            return sum + (Number(inv.quantity) * currentPrice);
        }, 0);

        const totalCost = investments.reduce((sum, inv) => {
            return sum + (Number(inv.quantity) * Number(inv.averagePrice));
        }, 0);

        const totalGainLoss = totalValue - totalCost;
        const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

        return {
            totalValue,
            totalCost,
            totalGainLoss,
            totalGainLossPercent,
            investmentCount: investments.length,
        };
    }

    async getPerformanceMetrics(userId: string): Promise<any> {
        const investments = await this.investmentsRepository.find({
            where: { userId },
            relations: ['asset'],
        });

        const transactions = await this.transactionsRepository.find({
            where: { userId },
        });

        const totalInvested = transactions
            .filter(t => t.type === 'buy')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalDividends = transactions
            .filter(t => t.type === 'dividend')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalFees = transactions.reduce((sum, t) => sum + Number(t.fees), 0);

        const currentValue = investments.reduce((sum, inv) => {
            const currentPrice = Number(inv.asset?.currentPrice || inv.averagePrice);
            return sum + (Number(inv.quantity) * currentPrice);
        }, 0);

        const netReturn = currentValue + totalDividends - totalInvested - totalFees;
        const netReturnPercent = totalInvested > 0 ? (netReturn / totalInvested) * 100 : 0;

        return {
            totalInvested,
            currentValue,
            totalDividends,
            totalFees,
            netReturn,
            netReturnPercent,
            transactionCount: transactions.length,
        };
    }

    async getAssetAllocation(userId: string): Promise<any> {
        const investments = await this.investmentsRepository.find({
            where: { userId },
            relations: ['asset'],
        });

        const allocationByType: Record<string, { value: number; count: number }> = {};

        investments.forEach(inv => {
            const type = inv.asset?.type || 'other';
            const value = Number(inv.quantity) * Number(inv.asset?.currentPrice || inv.averagePrice);

            if (!allocationByType[type]) {
                allocationByType[type] = { value: 0, count: 0 };
            }

            allocationByType[type].value += value;
            allocationByType[type].count += 1;
        });

        const totalValue = Object.values(allocationByType).reduce((sum, item) => sum + item.value, 0);

        const allocation = Object.entries(allocationByType).map(([type, data]) => ({
            type,
            value: data.value,
            count: data.count,
            percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
        }));

        return {
            allocation,
            totalValue,
        };
    }

    async getRiskDistribution(userId: string): Promise<any> {
        const investments = await this.investmentsRepository.find({
            where: { userId },
            relations: ['asset'],
        });

        const distribution: Record<string, number> = {
            low: 0,
            medium: 0,
            high: 0
        };

        let totalValue = 0;

        investments.forEach(inv => {
            const risk = (inv.asset?.riskLevel || 'medium').toLowerCase();
            const value = Number(inv.quantity) * Number(inv.asset?.currentPrice || inv.averagePrice);

            if (distribution[risk] !== undefined) {
                distribution[risk] += value;
            } else {
                distribution.medium += value;
            }
            totalValue += value;
        });

        return {
            low: totalValue > 0 ? (distribution.low / totalValue) * 100 : 0,
            medium: totalValue > 0 ? (distribution.medium / totalValue) * 100 : 0,
            high: totalValue > 0 ? (distribution.high / totalValue) * 100 : 0,
            totalValue
        };
    }

    async getHistoricalData(userId: string, days: number = 30): Promise<any> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateString = startDate.toISOString().split('T')[0];

        const snapshots = await this.portfolioSnapshotsRepository.find({
            where: {
                userId,
                date: MoreThanOrEqual(startDateString)
            },
            order: { date: 'ASC' }
        });

        // If no snapshots yet, use current value as a single point
        if (snapshots.length === 0) {
            const analytics = await this.getPortfolioAnalytics(userId);
            return {
                period: `${days} days`,
                data: [{
                    date: new Date().toISOString().split('T')[0],
                    value: analytics.totalValue
                }]
            };
        }

        return {
            period: `${days} days`,
            data: snapshots.map(s => ({
                date: s.date,
                value: Number(s.totalValue)
            }))
        };
    }
}
