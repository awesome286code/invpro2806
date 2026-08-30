import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Investment } from '../entities/investment.entity';
import { Transaction } from '../entities/transaction.entity';
import { Portfolio } from '../entities/portfolio.entity';
import { PortfolioSnapshot } from '../entities/portfolio-snapshot.entity';
import { CashFlowSnapshot } from '../entities/cashflow-snapshot.entity';
import { User } from '../entities/user.entity';
import { SnapshotService } from './snapshot.service';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Investment,
            Transaction,
            Portfolio,
            PortfolioSnapshot,
            CashFlowSnapshot
        ]),
        AuthModule
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService, SnapshotService],
    exports: [AnalyticsService, SnapshotService],
})
export class AnalyticsModule { }
