import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Investment, Transaction, PortfolioSnapshot, CashFlowSnapshot } from '../entities';

@Injectable()
export class SnapshotService {
    private readonly logger = new Logger(SnapshotService.name);

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Investment)
        private investmentsRepository: Repository<Investment>,
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(PortfolioSnapshot)
        private portfolioSnapshotsRepository: Repository<PortfolioSnapshot>,
        @InjectRepository(CashFlowSnapshot)
        private cashFlowSnapshotsRepository: Repository<CashFlowSnapshot>,
    ) { }

    // Run every day at 23:59:59
    @Cron('59 59 23 * * *')
    async handleDailySnapshot() {
        this.logger.log('Starting daily portfolio and cash flow snapshots...');
        await this.takeSnapshots();
        this.logger.log('Daily snapshots completed.');
    }

    async takeSnapshots() {
        const users = await this.usersRepository.find();
        const today = new Date().toISOString().split('T')[0];

        for (const user of users) {
            try {
                // Take Portfolio Snapshot
                const investments = await this.investmentsRepository.find({
                    where: { userId: user.id },
                    relations: ['asset'],
                });

                const totalValue = investments.reduce((sum, inv) => {
                    const currentPrice = Number(inv.asset?.currentPrice || inv.averagePrice);
                    return sum + (Number(inv.quantity) * currentPrice);
                }, 0);

                const portfolioSnapshot = this.portfolioSnapshotsRepository.create({
                    userId: user.id,
                    totalValue,
                    date: today,
                });
                await this.portfolioSnapshotsRepository.save(portfolioSnapshot);

                // Take Cash Flow Snapshot
                const transactions = await this.transactionsRepository.find({
                    where: { userId: user.id },
                });

                const totalInvested = transactions
                    .filter(t => t.type === 'buy')
                    .reduce((sum, t) => sum + Number(t.amount), 0);

                const totalDividends = transactions
                    .filter(t => t.type === 'dividend')
                    .reduce((sum, t) => sum + Number(t.amount), 0);

                const totalFees = transactions.reduce((sum, t) => sum + Number(t.fees), 0);

                const cashFlowSnapshot = this.cashFlowSnapshotsRepository.create({
                    userId: user.id,
                    totalInvested,
                    totalDividends,
                    totalFees,
                    date: today,
                });
                await this.cashFlowSnapshotsRepository.save(cashFlowSnapshot);

                this.logger.log(`Snapshots saved for user ${user.id}: Value ${totalValue}, Invested ${totalInvested}`);
            } catch (error) {
                this.logger.error(`Failed to take snapshots for user ${user.id}: ${error.message}`);
            }
        }
    }

    // Optional: Helper to manually trigger or for testing
    async runManualSnapshot() {
        await this.takeSnapshots();
    }
}
