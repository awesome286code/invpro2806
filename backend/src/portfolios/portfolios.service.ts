
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Portfolio } from '../entities/portfolio.entity';
import { Transaction } from '../entities/transaction.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { Investment } from '../entities/investment.entity';

@Injectable()
export class PortfoliosService {
    constructor(
        @InjectRepository(Portfolio)
        private portfoliosRepository: Repository<Portfolio>,
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(Investment)
        private investmentsRepository: Repository<Investment>,
    ) { }

    async create(userId: string, createPortfolioDto: CreatePortfolioDto): Promise<Portfolio> {
        const portfolio = this.portfoliosRepository.create({
            ...createPortfolioDto,
            userId,
        });

        return await this.portfoliosRepository.save(portfolio);
    }

    async findAll(userId: string): Promise<any[]> {
        const portfolios = await this.portfoliosRepository.find({
            where: { userId },
            relations: ['investments', 'investments.asset'],
            order: { createdAt: 'DESC' },
        });

        // Fetch orphaned investments
        const orphanedInvestments = await this.investmentsRepository.find({
            where: { userId, portfolioId: IsNull() },
            relations: ['asset']
        });

        const allPortfolios = [...portfolios];

        // But wait, if we have a real "Unknown" portfolio (created by delete), its investments are NOT orphaned (they have portfolioId pointing to that ID).
        // Only truly Null portfolioId investments are orphaned.
        // Only add virtual "Unknown" portfolio if there are truly orphaned investments
        if (orphanedInvestments.length > 0) {
            const virtualUnknown: any = {
                id: 'unknown',
                name: 'Unknown',
                description: 'Uncategorized Assets',
                status: 'active',
                riskProfile: 'unknown',
                allocations: [],
                investments: orphanedInvestments,
                userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                isVirtual: true // Marker for frontend if needed
            };
            allPortfolios.push(virtualUnknown);
        }

        return allPortfolios.map(portfolio => {
            let totalValue = 0;
            let totalCost = 0;
            const allocationByType: Record<string, number> = {};

            const investments = portfolio.investments || [];

            investments.forEach(inv => {
                const currentPrice = Number(inv.asset?.currentPrice || inv.averagePrice || 0);
                const averagePrice = Number(inv.averagePrice || 0);
                const quantity = Number(inv.quantity || 0);

                const value = currentPrice * quantity;
                const cost = averagePrice * quantity;

                totalValue += value;
                totalCost += cost;

                // Allocation
                const type = inv.asset?.type || 'other';
                allocationByType[type] = (allocationByType[type] || 0) + value;
            });

            const totalGainLoss = totalValue - totalCost;
            const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

            // Format allocations for frontend
            const allocations = Object.entries(allocationByType).map(([id, value]) => ({
                id,
                label: id.charAt(0).toUpperCase() + id.slice(1), // Simple capitalization
                value: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
                color: this.getColorForType(id) // Helper method needed
            })).sort((a, b) => b.value - a.value);

            return {
                ...portfolio,
                totalValue,
                totalGainLoss,
                totalGainLossPercent,
                allocations
            };
        });
    }

    private getColorForType(type: string): string {
        const colors: Record<string, string> = {
            'stock': '#3b82f6', // blue-500
            'crypto': '#a855f7', // purple-500
            'real_estate': '#22c55e', // green-500
            'bond': '#64748b', // slate-500
            'cash': '#f59e0b', // amber-500
            'fund': '#ec4899', // pink-500
            'other': '#94a3b8' // slate-400
        };
        return colors[type.toLowerCase()] || colors['other'];
    }

    async findOne(id: string, userId: string): Promise<Portfolio> {
        if (id === 'unknown') {
            const orphanedInvestments = await this.investmentsRepository.find({
                where: { userId, portfolioId: IsNull() },
                relations: ['asset']
            });

            // Return a virtual portfolio object that satisfies the Portfolio interface
            // Cast as any/Portfolio since it's not a real DB entity
            return {
                id: 'unknown',
                name: 'Unknown',
                description: 'Uncategorized Assets',
                status: 'active',
                userId,
                investments: orphanedInvestments,
                createdAt: new Date(),
                updatedAt: new Date(),
                // Default other required fields
                baseCurrency: 'USD',
            } as any as Portfolio;
        }

        const portfolio = await this.portfoliosRepository.findOne({
            where: { id, userId },
            relations: ['investments', 'investments.asset'],
        });

        if (!portfolio) {
            throw new NotFoundException(`Portfolio with ID ${id} not found`);
        }

        return portfolio;
    }

    async update(id: string, userId: string, updatePortfolioDto: UpdatePortfolioDto): Promise<Portfolio> {
        if (id === 'unknown') {
            throw new NotFoundException('Cannot edit the Unknown portfolio');
        }
        const portfolio = await this.findOne(id, userId);
        Object.assign(portfolio, updatePortfolioDto);
        return await this.portfoliosRepository.save(portfolio);
    }

    async remove(id: string, userId: string): Promise<void> {
        if (id === 'unknown') {
            throw new NotFoundException('Cannot delete the Unknown portfolio directly');
        }
        const portfolio = await this.findOne(id, userId);

        // Prevent deleting the "Unknown" portfolio if it is the target
        // if (portfolio.name === 'Unknown') {
        //     // Or throw error, but for now just return
        //     return;
        // }

        // Move assets to "Orphaned" state (portfolioId = NULL)
        // They will be picked up by findAll as part of the virtual "Unknown" portfolio
        await this.investmentsRepository.update(
            { portfolioId: id },
            { portfolioId: null }
        );

        // Remove the portfolio
        await this.portfoliosRepository.remove(portfolio);
    }

    async getHoldings(id: string, userId: string): Promise<any> {
        const portfolio = await this.findOne(id, userId);

        const holdings = portfolio.investments.map(inv => {
            const currentPrice = Number(inv.asset?.currentPrice || inv.averagePrice);
            return {
                id: inv.id,
                symbol: inv.asset?.symbol,
                name: inv.asset?.name,
                quantity: inv.quantity,
                averagePrice: inv.averagePrice,
                currentPrice: currentPrice,
                totalValue: Number(inv.quantity) * currentPrice,
                totalCost: Number(inv.quantity) * Number(inv.averagePrice),
                gainLoss: (currentPrice - Number(inv.averagePrice)) * Number(inv.quantity),
                gainLossPercent: Number(inv.averagePrice) > 0 ? ((currentPrice - Number(inv.averagePrice)) / Number(inv.averagePrice)) * 100 : 0,
                type: inv.asset?.type,
            };
        });

        const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
        const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
        const totalGainLoss = totalValue - totalCost;
        const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

        return {
            portfolio: {
                id: portfolio.id,
                name: portfolio.name,
                description: portfolio.description,
                objective: portfolio.objective,
                timeHorizon: portfolio.timeHorizon,
                riskProfile: portfolio.riskProfile,
                baseCurrency: portfolio.baseCurrency,
                benchmark: portfolio.benchmark,
            },
            holdings,
            summary: {
                totalValue,
                totalCost,
                totalGainLoss,
                totalGainLossPercent,
                count: holdings.length,
            },
        };
    }

    async getPortfolioAnalytics(id: string, userId: string): Promise<any> {
        const portfolio = await this.findOne(id, userId);

        // Calculate portfolio metrics
        let totalValue = 0;
        let totalCost = 0;
        const investments = portfolio.investments || [];

        investments.forEach(inv => {
            const currentPrice = Number(inv.asset?.currentPrice || inv.averagePrice);
            const quantity = Number(inv.quantity);
            const averagePrice = Number(inv.averagePrice);

            totalValue += currentPrice * quantity;
            totalCost += averagePrice * quantity;
        });

        const totalGainLoss = totalValue - totalCost;
        const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

        // Get transactions for this portfolio
        let transactions = [];
        if (id === 'unknown') {
            // For unknown portfolio, get transactions where investment has no portfolio
            transactions = await this.transactionsRepository
                .createQueryBuilder('transaction')
                .leftJoin('transaction.investment', 'investment')
                .leftJoin('investment.asset', 'asset')
                .where('investment.portfolioId IS NULL')
                .andWhere('transaction.userId = :userId', { userId })
                .orderBy('transaction.transactionDate', 'DESC')
                .take(10)
                .getMany();
        } else {
            transactions = await this.transactionsRepository
                .createQueryBuilder('transaction')
                .leftJoin('transaction.investment', 'investment')
                .leftJoin('investment.asset', 'asset')
                .where('investment.portfolioId = :portfolioId', { portfolioId: id })
                .andWhere('transaction.userId = :userId', { userId })
                .orderBy('transaction.transactionDate', 'DESC')
                .take(10)
                .getMany();
        }

        // Calculate diversity score (number of different assets)
        const diversityScore = investments.length;

        // Calculate risk score based on volatility (simplified)
        const riskScore = investments.length > 0 ?
            Math.min(10, Math.max(1, Math.abs(totalGainLossPercent) / 10)) : 5;

        return {
            portfolio: {
                id: portfolio.id,
                name: portfolio.name,
                description: portfolio.description,
                objective: portfolio.objective,
                timeHorizon: portfolio.timeHorizon,
                riskProfile: portfolio.riskProfile,
                baseCurrency: portfolio.baseCurrency,
                benchmark: portfolio.benchmark,
            },
            metrics: {
                totalValue,
                totalCost,
                totalGainLoss,
                totalGainLossPercent,
                assetCount: investments.length,
                diversityScore,
                riskScore,
            },
            recentTransactions: transactions,
        };
    }

    async getAssetAllocation(id: string, userId: string): Promise<any> {
        const portfolio = await this.findOne(id, userId);

        const investments = portfolio.investments || [];
        const allocationByType: Record<string, any> = {};
        let totalValue = 0;

        // Calculate allocation by type
        investments.forEach(inv => {
            const currentPrice = Number(inv.asset?.currentPrice || inv.averagePrice);
            const quantity = Number(inv.quantity);
            const value = currentPrice * quantity;
            const type = inv.asset?.type || 'other';

            totalValue += value;

            if (!allocationByType[type]) {
                allocationByType[type] = {
                    type,
                    value: 0,
                    count: 0,
                    percentage: 0,
                    assets: [],
                };
            }

            allocationByType[type].value += value;
            allocationByType[type].count += 1;
            allocationByType[type].assets.push({
                symbol: inv.asset?.symbol,
                name: inv.asset?.name,
                value,
            });
        });

        // Calculate percentages
        Object.keys(allocationByType).forEach(type => {
            allocationByType[type].percentage = totalValue > 0
                ? (allocationByType[type].value / totalValue) * 100
                : 0;
        });

        const allocation = Object.values(allocationByType).sort((a: any, b: any) => b.value - a.value);

        return {
            portfolio: {
                id: portfolio.id,
                name: portfolio.name,
            },
            totalValue,
            allocation,
        };
    }
}
