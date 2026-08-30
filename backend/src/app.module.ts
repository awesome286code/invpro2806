import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { SocketModule } from './socket/socket.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { AlertsModule } from './alerts/alerts.module';
import { SettingsModule } from './settings/settings.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { User, Investment, Transaction, Alert, UserSettings, Portfolio, Asset, PortfolioSnapshot, CashFlowSnapshot, StockReport } from './entities';
import { DashboardModule } from './dashboard/dashboard.module';
import { HoldingsModule } from './holdings/holdings.module';
import { ReportsModule } from './reports/reports.module';
import { MarketDataModule } from './market-data/market-data.module';
import { AssetsModule } from './assets/assets.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_NAME'),
                entities: [User, Investment, Transaction, Alert, UserSettings, Portfolio, Asset, PortfolioSnapshot, CashFlowSnapshot, StockReport],
                synchronize: true, // Set to false in production
                logging: false,
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        SocketModule,
        TransactionsModule,
        PortfoliosModule,
        AlertsModule,
        SettingsModule,
        AnalyticsModule,
        DashboardModule,
        HoldingsModule,
        ReportsModule,
        MarketDataModule,
        AssetsModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes('*');
    }
}


