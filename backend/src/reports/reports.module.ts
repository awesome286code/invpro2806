import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Portfolio } from '../entities/portfolio.entity';
import { Transaction } from '../entities/transaction.entity';
import { Investment } from '../entities/investment.entity';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Portfolio, Transaction, Investment]),
        AuthModule,
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule { }
