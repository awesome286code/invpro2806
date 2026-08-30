import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from '../entities/portfolio.entity';
import { Transaction } from '../entities/transaction.entity';
import { Investment } from '../entities/investment.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Portfolio)
        private portfolioRepo: Repository<Portfolio>,
        @InjectRepository(Transaction)
        private transactionRepo: Repository<Transaction>,
        @InjectRepository(Investment)
        private investmentRepo: Repository<Investment>,
    ) { }

    async getPortfolioPerformance(userId: string, portfolioId?: string) {
        // Mock implementation of advanced metrics for now
        // In real system, this would calculate time-weighted returns, CAGR, etc.

        const where = { userId };
        if (portfolioId) Object.assign(where, { id: portfolioId });

        const portfolios = await this.portfolioRepo.find({
            where,
            relations: ['investments', 'investments.asset']
        });

        const investments = portfolios.flatMap(p => p.investments);

        let totalValue = 0;
        let totalCost = 0;

        investments.forEach(inv => {
            const currentPrice = Number(inv.asset?.currentPrice || inv.averagePrice);
            const quantity = Number(inv.quantity);
            const averagePrice = Number(inv.averagePrice);

            totalValue += currentPrice * quantity;
            totalCost += averagePrice * quantity;
        });

        const gainLoss = totalValue - totalCost;
        const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

        return {
            totalValue,
            totalCost,
            unrealizedPL: gainLoss,
            unrealizedPLPercent: gainLossPercent,
            cagr: 12.5, // Placeholder
            maxDrawdown: -15.2, // Placeholder
            sharpeRatio: 1.8, // Placeholder
            volatility: 14.2, // Placeholder
        };
    }

    async getAllocation(userId: string) {
        const investments = await this.investmentRepo.find({
            where: { userId },
            relations: ['asset']
        });

        const byAssetClass: Record<string, number> = {};
        let totalValue = 0;

        investments.forEach(inv => {
            const currentPrice = Number(inv.asset?.currentPrice || inv.averagePrice);
            const quantity = Number(inv.quantity);
            const value = currentPrice * quantity;
            const type = inv.asset?.type || 'Unknown';

            byAssetClass[type] = (byAssetClass[type] || 0) + value;
            totalValue += value;
        });

        return Object.entries(byAssetClass).map(([type, value]) => ({
            type,
            value,
            percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
        }));
    }
}
