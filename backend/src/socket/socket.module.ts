import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SocketGateway } from './socket.gateway';
import { InvestmentService } from './investment.service';
import { InvestmentGateway } from './investment.gateway';
import { Investment } from '../entities/investment.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { AlertsModule } from '../alerts/alerts.module';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Investment]),
        TransactionsModule,
        PortfoliosModule,
        AlertsModule,
        AuthModule,
    ],
    providers: [SocketGateway, InvestmentService],
    exports: [SocketGateway],
})
export class SocketModule { }

