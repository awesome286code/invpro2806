import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from '../entities/transaction.entity';

import { AuthModule } from '../auth/auth.module';

import { Investment } from '../entities/investment.entity';
import { Portfolio } from '../entities/portfolio.entity';
import { Asset } from '../entities/asset.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction, Investment, Portfolio, Asset]), AuthModule],
    controllers: [TransactionsController],
    providers: [TransactionsService],
    exports: [TransactionsService],
})
export class TransactionsModule { }
