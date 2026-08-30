import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Portfolio } from '../entities/portfolio.entity';
import { Investment } from '../entities/investment.entity';
import { Transaction } from '../entities/transaction.entity';
import { Asset } from '../entities/asset.entity';
import { PortfolioSnapshot } from '../entities/portfolio-snapshot.entity';
import { CashFlowSnapshot } from '../entities/cashflow-snapshot.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Portfolio)
        private portfoliosRepository: Repository<Portfolio>,
        @InjectRepository(Investment)
        private investmentsRepository: Repository<Investment>,
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(PortfolioSnapshot)
        private portfolioSnapshotsRepository: Repository<PortfolioSnapshot>,
        @InjectRepository(CashFlowSnapshot)
        private cashFlowSnapshotsRepository: Repository<CashFlowSnapshot>,
    ) { }

    async getSummary(userId: string) {
        // Get all portfolios
        const portfolios = await this.portfoliosRepository.find({
            where: { userId },
            relations: ['investments'],
        });

        // Get all investments
        const investments = await this.investmentsRepository.find({
            where: { userId },
            relations: ['asset'],
        });

        // Calculate totals
        let totalValue = 0;
        let totalCost = 0;

        investments.forEach(inv => {
            const currentPrice = Number(inv.asset?.currentPrice || inv.averagePrice);
            const quantity = Number(inv.quantity);
            const averagePrice = Number(inv.averagePrice);

            totalValue += currentPrice * quantity;
            totalCost += averagePrice * quantity;
        });

        const totalGainLoss = totalValue - totalCost;
        const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

        return {
            totalValue,
            totalCost,
            totalGainLoss,
            totalGainLossPercent,
            portfolioCount: portfolios.length,
            assetCount: investments.length,
        };
    }

    async getPerformance(userId: string, timeRange: string = '1M') {
        const now = new Date();
        let startDate = new Date();

        switch (timeRange) {
            case '1W':
                startDate.setDate(now.getDate() - 7);
                break;
            case '1M':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case '3M':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case '6M':
                startDate.setMonth(now.getMonth() - 6);
                break;
            case '1Y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
        }

        const startDateString = startDate.toISOString().split('T')[0];

        // Try to get from snapshots first
        const snapshots = await this.portfolioSnapshotsRepository.find({
            where: {
                userId,
                date: MoreThanOrEqual(startDateString)
            },
            order: { date: 'ASC' }
        });

        if (snapshots.length > 0) {
            return {
                timeRange,
                data: snapshots.map(s => ({
                    date: s.date,
                    value: Number(s.totalValue)
                }))
            };
        }

        // Fallback to transaction-based calculation (original logic)
        const transactions = await this.transactionsRepository.find({
            where: { userId },
            order: { transactionDate: 'ASC' },
        });

        const investments = await this.investmentsRepository.find({
            where: { userId },
            relations: ['asset'],
        });

        let currentValue = 0;
        investments.forEach(inv => {
            currentValue += Number(inv.asset?.currentPrice || inv.averagePrice) * Number(inv.quantity);
        });

        const dataPoints = [];
        const filteredTransactions = transactions.filter(
            t => new Date(t.transactionDate) >= startDate
        );

        const dateMap = new Map<string, number>();
        let runningValue = 0;

        filteredTransactions.forEach(txn => {
            const date = new Date(txn.transactionDate).toISOString().split('T')[0];
            const amount = Number(txn.amount);

            if (txn.type === 'buy') {
                runningValue += amount;
            } else if (txn.type === 'sell') {
                runningValue -= amount;
            }

            dateMap.set(date, runningValue);
        });

        dateMap.forEach((value, date) => {
            dataPoints.push({ date, value });
        });

        dataPoints.push({
            date: now.toISOString().split('T')[0],
            value: currentValue,
        });

        return {
            timeRange,
            data: dataPoints,
        };
    }

    async getTopPerformers(userId: string, limit: number = 5) {
        const investments = await this.investmentsRepository.find({
            where: { userId },
            relations: ['asset'],
        });

        // Calculate gain/loss for each investment
        const performanceData = investments.map(inv => {
            const currentPrice = Number(inv.asset?.currentPrice || inv.averagePrice);
            const averagePrice = Number(inv.averagePrice);
            const quantity = Number(inv.quantity);

            const gainLoss = (currentPrice - averagePrice) * quantity;
            const gainLossPercent = averagePrice > 0 ? ((currentPrice - averagePrice) / averagePrice) * 100 : 0;

            return {
                ...inv,
                symbol: inv.asset?.symbol,
                name: inv.asset?.name,
                gainLoss,
                gainLossPercent,
                currentValue: currentPrice * quantity,
            };
        });

        // Sort by gain/loss percent
        const sorted = performanceData.sort((a, b) => b.gainLossPercent - a.gainLossPercent);

        return {
            gainers: sorted.slice(0, limit),
            losers: sorted.slice(-limit).reverse(),
        };
    }

    async getRecentActivity(userId: string, limit: number = 10) {
        const transactions = await this.transactionsRepository.find({
            where: { userId },
            order: { transactionDate: 'DESC' },
            take: limit,
        });

        return transactions;
    }
}
