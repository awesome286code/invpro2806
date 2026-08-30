import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HoldingsService } from './holdings.service';
import { HoldingsController } from './holdings.controller';
import { Investment } from '../entities/investment.entity';
import { Transaction } from '../entities/transaction.entity';
import { AuthModule } from '../auth/auth.module';

import { Asset } from '../entities/asset.entity';
import { StockReport } from '../entities/stock-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Investment, Transaction, Asset, StockReport]),
    AuthModule,
  ],
  providers: [HoldingsService],
  controllers: [HoldingsController]
})
export class HoldingsModule { }
