import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Portfolio } from '../entities/portfolio.entity';
import { Investment } from '../entities/investment.entity';
import { Transaction } from '../entities/transaction.entity';
import { AuthModule } from '../auth/auth.module';

import { PortfolioSnapshot } from '../entities/portfolio-snapshot.entity';
import { CashFlowSnapshot } from '../entities/cashflow-snapshot.entity';
import { Asset } from '../entities/asset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Portfolio, Investment, Transaction, PortfolioSnapshot, CashFlowSnapshot, Asset]),
    AuthModule,
  ],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule { }
