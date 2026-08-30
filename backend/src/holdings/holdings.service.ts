import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from '../entities/investment.entity';
import { Transaction } from '../entities/transaction.entity';
import { Asset } from '../entities/asset.entity';
import { StockReport } from '../entities/stock-report.entity';

@Injectable()
export class HoldingsService {
    constructor(
        @InjectRepository(Investment)
        private investmentsRepository: Repository<Investment>,
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(Asset)
        private assetsRepository: Repository<Asset>,
        @InjectRepository(StockReport)
        private reportsRepository: Repository<StockReport>,
    ) { }

    async updateCurrentPrice(id: string, userId: string, currentPrice: number) {
        const investment = await this.investmentsRepository.findOne({
            where: { id, userId },
        });

        if (!investment) {
            throw new NotFoundException(`Holding with ID ${id} not found`);
        }

        const asset = await this.assetsRepository.findOne({ where: { id: investment.assetId } });
        if (asset) {
            asset.currentPrice = currentPrice;
            await this.assetsRepository.save(asset);
        }

        return { success: true };
    }

    async findAll(userId: string, filters?: any) {
        const query = this.investmentsRepository.createQueryBuilder('investment')
            .leftJoinAndSelect('investment.asset', 'asset')
            .leftJoinAndSelect('investment.portfolio', 'portfolio')
            .where('investment.userId = :userId', { userId });

        if (filters?.portfolioId) {
            query.andWhere('investment.portfolioId = :portfolioId', { portfolioId: filters.portfolioId });
        }

        if (filters?.type) {
            query.andWhere('asset.type = :type', { type: filters.type });
        }

        const investments = await query.getMany();

        // Calculate metrics for each holding
        return investments.map(inv => {
            const currentPrice = Number(inv.asset?.currentPrice || inv.averagePrice);
            const averagePrice = Number(inv.averagePrice);
            const quantity = Number(inv.quantity);

            const totalValue = currentPrice * quantity;
            const totalCost = averagePrice * quantity;
            const gainLoss = totalValue - totalCost;
            const gainLossPercent = averagePrice > 0 ? ((currentPrice - averagePrice) / averagePrice) * 100 : 0;

            return {
                id: inv.id,
                portfolioId: inv.portfolioId,
                portfolio: inv.portfolio,
                assetId: inv.assetId,
                symbol: inv.asset?.symbol,
                name: inv.asset?.name,
                type: inv.asset?.type,
                currentPrice,
                averagePrice,
                quantity,
                logo: inv.asset?.logo,
                sector: inv.asset?.sector,
                volume: inv.asset?.volume,
                currency: inv.asset?.currency || 'USD',
                dailyOpenPrice: inv.asset?.dailyOpenPrice || currentPrice,
                totalValue,
                totalCost,
                gainLoss,
                gainLossPercent,
                createdAt: inv.createdAt,
                updatedAt: inv.updatedAt,
            };
        });
    }

    async findOne(id: string, userId: string) {
        const investment = await this.investmentsRepository.findOne({
            where: { id, userId },
            relations: ['portfolio', 'asset'],
        });

        if (!investment) {
            throw new NotFoundException(`Holding with ID ${id} not found`);
        }

        const currentPrice = Number(investment.asset?.currentPrice || investment.averagePrice);
        const averagePrice = Number(investment.averagePrice);
        const quantity = Number(investment.quantity);

        const totalValue = currentPrice * quantity;
        const totalCost = averagePrice * quantity;
        const gainLoss = totalValue - totalCost;
        const gainLossPercent = averagePrice > 0 ? ((currentPrice - averagePrice) / averagePrice) * 100 : 0;

        return {
            ...investment,
            symbol: investment.asset?.symbol,
            name: investment.asset?.name,
            currentPrice,
            totalPrice: currentPrice * quantity,
            volume: investment.asset?.volume,
            currency: investment.asset?.currency || 'USD',
            dailyOpenPrice: investment.asset?.dailyOpenPrice || currentPrice,
            totalValue,
            totalCost,
            gainLoss,
            gainLossPercent,
        };
    }

    // Deprecated: Use TransactionsService to add transactions which updates holdings
    async getTransactions(id: string, userId: string) {
        const investment = await this.investmentsRepository.findOne({
            where: { id, userId },
        });

        if (!investment) {
            throw new NotFoundException(`Holding with ID ${id} not found`);
        }

        const transactions = await this.transactionsRepository.find({
            where: { investmentId: id, userId },
            order: { transactionDate: 'DESC' },
        });

        return transactions;
    }

    async getAssetDetailBySymbol(symbol: string, userId: string) {
        const asset = await this.assetsRepository.findOne({ where: { symbol } });
        if (!asset) {
            throw new NotFoundException(`Asset with symbol ${symbol} not found`);
        }

        const investments = await this.investmentsRepository.find({
            where: { assetId: asset.id, userId },
            relations: ['portfolio'],
        });

        const transactions = await this.transactionsRepository.find({
            where: { symbol, userId },
            order: { transactionDate: 'DESC' },
            relations: ['investment', 'investment.portfolio'],
        });

        const reports = await this.reportsRepository.find({
            where: { symbol },
            order: { publishedDate: 'DESC' },
            take: 10
        });

        const totalQuantity = investments.reduce((sum, inv) => sum + Number(inv.quantity), 0);
        const totalCost = investments.reduce((sum, inv) => sum + (Number(inv.quantity) * Number(inv.averagePrice)), 0);
        const averagePrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
        const currentPrice = Number(asset.currentPrice || averagePrice);
        const totalValue = totalQuantity * currentPrice;
        const gainLoss = totalValue - totalCost;
        const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

        return {
            asset: {
                ...asset,
                currentPrice,
            },
            holdings: investments.map(inv => ({
                id: inv.id,
                portfolio: inv.portfolio,
                quantity: Number(inv.quantity),
                averagePrice: Number(inv.averagePrice),
                currentValue: Number(inv.quantity) * currentPrice,
            })),
            transactions: transactions.map(t => ({
                ...t,
                amount: Number(t.amount),
                quantity: Number(t.quantity),
                price: Number(t.price),
                fees: Number(t.fees),
                portfolioName: t.investment?.portfolio?.name
            })),
            reports: reports.map(r => ({
                id: r.id,
                title: r.title,
                summary: r.summary,
                author: r.author,
                type: r.type,
                category: r.category,
                publishedDate: r.publishedDate,
                contentUrl: r.contentUrl
            })),
            metrics: {
                totalQuantity,
                totalCost,
                averagePrice,
                currentValue: totalValue,
                gainLoss,
                gainLossPercent,
                dayChange: currentPrice - Number(asset.dailyOpenPrice || currentPrice),
                dayChangePercent: asset.dailyOpenPrice ? ((currentPrice - Number(asset.dailyOpenPrice)) / Number(asset.dailyOpenPrice)) * 100 : 0,
            }
        };
    }
}
