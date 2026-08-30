import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfoliosService } from './portfolios.service';
import { PortfoliosController } from './portfolios.controller';
import { Portfolio } from '../entities/portfolio.entity';
import { Transaction } from '../entities/transaction.entity';
import { Investment } from '../entities/investment.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([Portfolio, Transaction, Investment]), AuthModule],
    controllers: [PortfoliosController],
    providers: [PortfoliosService],
    exports: [PortfoliosService],
})
export class PortfoliosModule { }
