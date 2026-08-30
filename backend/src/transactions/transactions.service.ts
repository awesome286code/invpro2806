import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Investment } from '../entities/investment.entity';
import { Asset } from '../entities/asset.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(Investment)
        private investmentsRepository: Repository<Investment>,
        @InjectRepository(Asset)
        private assetsRepository: Repository<Asset>,
        private dataSource: DataSource,
    ) { }

    async create(userId: string, createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let { investmentId } = createTransactionDto;
            const { type, amount, quantity, price, fees, transactionDate, portfolioId, symbol, assetName } = createTransactionDto;
            let currentInvestment: Investment | null = null;

            // If investmentId is missing but portfolioId and symbol are present, try to find or create investment
            if (!investmentId && portfolioId && symbol) {
                // Handle "Unknown" virtual portfolio which corresponds to null portfolioId
                const targetPortfolioId = portfolioId === 'unknown' ? null : portfolioId;

                // Find asset by symbol - Use manager within transaction
                let asset = await queryRunner.manager.findOne(Asset, { where: { symbol } });

                if (!asset && assetName) {
                    // Create new asset if it doesn't exist and we have a name
                    asset = this.assetsRepository.create({
                        symbol,
                        name: assetName,
                        currentPrice: price || 0,
                        type: 'stock',
                        currency: 'USD'
                    });
                    asset = await queryRunner.manager.save(asset);
                }

                if (asset) {
                    // Check for existing investment
                    currentInvestment = await queryRunner.manager.findOne(Investment, {
                        where: {
                            portfolioId: targetPortfolioId,
                            assetId: asset.id
                        }
                    });

                    if (currentInvestment) {
                        investmentId = currentInvestment.id;
                    } else {
                        // Create new investment
                        const newInvestment = this.investmentsRepository.create({
                            userId,
                            portfolioId: targetPortfolioId,
                            assetId: asset.id,
                            quantity: 0,
                            averagePrice: 0
                        });
                        currentInvestment = await queryRunner.manager.save(newInvestment);
                        investmentId = currentInvestment.id;
                    }
                }
            }

            // Create transaction record
            const { portfolioId: _pid, assetName: _an, ...transactionData } = createTransactionDto;
            const transaction = this.transactionsRepository.create({
                ...transactionData,
                userId,
                investmentId,
                transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
            });

            // If linked to an investment (BUY/SELL/DIVIDEND), update Investment state
            if (investmentId && (type === 'buy' || type === 'sell')) {
                // If we haven't found/created it above, find it now using manager
                if (!currentInvestment) {
                    currentInvestment = await queryRunner.manager.findOne(Investment, { where: { id: investmentId } });
                }

                if (!currentInvestment) {
                    throw new NotFoundException(`Investment with ID ${investmentId} not found`);
                }

                if (type === 'buy') {
                    // Calculate new Average Price
                    const oldQty = Number(currentInvestment.quantity);
                    const oldAvg = Number(currentInvestment.averagePrice);
                    const newQty = Number(quantity);
                    const buyPrice = Number(price);
                    const txnFees = Number(fees || 0);

                    // Avoid division by zero
                    const totalQty = oldQty + newQty;
                    if (totalQty > 0) {
                        const totalCost = (oldQty * oldAvg) + (newQty * buyPrice) + txnFees;
                        currentInvestment.quantity = totalQty;
                        currentInvestment.averagePrice = totalCost / totalQty;
                    } else {
                        currentInvestment.quantity = 0;
                    }

                } else if (type === 'sell') {
                    const oldQty = Number(currentInvestment.quantity);
                    const sellQty = Number(quantity);

                    if (oldQty < sellQty) {
                        throw new BadRequestException('Insufficient quantity to sell');
                    }

                    currentInvestment.quantity = oldQty - sellQty;
                }

                await queryRunner.manager.save(currentInvestment);
            }

            const savedTransaction = await queryRunner.manager.save(transaction);
            await queryRunner.commitTransaction();

            return savedTransaction;

        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(userId: string): Promise<Transaction[]> {
        return await this.transactionsRepository.find({
            where: { userId },
            order: { transactionDate: 'DESC' },
            relations: ['investment', 'investment.asset'],
        });
    }

    async findOne(id: string, userId: string): Promise<Transaction> {
        const transaction = await this.transactionsRepository.findOne({
            where: { id, userId },
            relations: ['investment', 'investment.asset'],
        });

        if (!transaction) {
            throw new NotFoundException(`Transaction with ID ${id} not found`);
        }

        return transaction;
    }

    async update(id: string, userId: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
        // Warning: Updating transactions might require recalculating history. 
        // For simplicity in MVP, we might allow non-financial updates (notes) or just blocking strict financial updates.
        // Or re-implement "Reverse and Re-apply".
        // Here we just update the record for now.

        const transaction = await this.findOne(id, userId);
        Object.assign(transaction, updateTransactionDto);
        if (updateTransactionDto.transactionDate) {
            transaction.transactionDate = new Date(updateTransactionDto.transactionDate);
        }
        return await this.transactionsRepository.save(transaction);
    }

    async remove(id: string, userId: string): Promise<void> {
        // Also complex: Removing a BUY should decrease quantity and simple-revert avg price?
        // For now, simple delete.
        const transaction = await this.findOne(id, userId);
        await this.transactionsRepository.remove(transaction);
    }

    async findByType(userId: string, type: string): Promise<Transaction[]> {
        return await this.transactionsRepository.find({
            where: { userId, type: type as any },
            order: { transactionDate: 'DESC' },
            relations: ['investment', 'investment.asset'],
        });
    }

    async findByStatus(userId: string, status: string): Promise<Transaction[]> {
        return await this.transactionsRepository.find({
            where: { userId, status: status as any },
            order: { transactionDate: 'DESC' },
            relations: ['investment'],
        });
    }

    async findByInvestment(userId: string, investmentId: string): Promise<Transaction[]> {
        return await this.transactionsRepository.find({
            where: { userId, investmentId },
            order: { transactionDate: 'DESC' },
        });
    }

    async getStats(userId: string): Promise<any> {
        const transactions = await this.findAll(userId);

        const stats = {
            total: transactions.length,
            byType: {} as Record<string, number>,
            byStatus: {} as Record<string, number>,
            totalAmount: 0,
            totalFees: 0,
        };

        transactions.forEach(t => {
            stats.byType[t.type] = (stats.byType[t.type] || 0) + 1;
            stats.byStatus[t.status] = (stats.byStatus[t.status] || 0) + 1;
            stats.totalAmount += Number(t.amount);
            stats.totalFees += Number(t.fees);
        });

        return stats;
    }
}
