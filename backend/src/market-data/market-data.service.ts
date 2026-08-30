import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../entities/asset.entity';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class MarketDataService {
    private readonly logger = new Logger(MarketDataService.name);

    constructor(
        @InjectRepository(Asset)
        private assetsRepository: Repository<Asset>,
        private socketGateway: SocketGateway,
    ) { }

    // Every 1 second
    @Cron('*/1 * * * * *')
    async handleCron() {
        this.logger.debug('Running 1-second stock price update...');
        await this.updateMarketPrices();
    }

    async updateMarketPrices() {
        try {
            const assets = await this.assetsRepository.find();
            const updates = [];

            for (const asset of assets) {
                // Simulation: Jitter price by -1% to +1%
                const jitter = (Math.random() * 0.02) - 0.01;
                const oldPrice = Number(asset.currentPrice);
                const newPrice = Number((oldPrice * (1 + jitter)).toFixed(2));

                // Simulation: Random volume
                const newVolume = Math.floor(Math.random() * 500000) + 100000;

                // Initialize dailyOpenPrice on first update of the day
                if (!asset.dailyOpenPrice) {
                    asset.dailyOpenPrice = oldPrice;
                }

                // Assign currency based on symbol
                if (asset.symbol.endsWith('.VN') || ['VNM', 'VCB', 'HPG', 'VHM'].includes(asset.symbol)) {
                    asset.currency = 'VND';
                } else {
                    asset.currency = 'USD';
                }

                // Assign riskLevel based on type
                const type = (asset.type || 'stock').toLowerCase();
                if (type === 'crypto') {
                    asset.riskLevel = 'high';
                } else if (type === 'etf' || type === 'fund' || type === 'reit') {
                    asset.riskLevel = 'low';
                } else {
                    asset.riskLevel = 'medium';
                }

                asset.currentPrice = newPrice;
                asset.volume = newVolume;
                updates.push(this.assetsRepository.save(asset));

                // Emit to clients subscribed to this symbol - minimal data
                this.socketGateway.server.to(`market:${asset.symbol}`).emit('market:price_updated', {
                    symbol: asset.symbol,
                    price: newPrice,
                    timestamp: new Date()
                });

                this.logger.log(`Updated ${asset.symbol}: Price ${oldPrice} -> ${newPrice}, Vol ${newVolume}`);
            }

            await Promise.all(updates);

            // Keep broadcasting summary to all connected clients - minimal array
            this.socketGateway.server.emit('market:prices_updated', {
                timestamp: new Date(),
                assets: assets.map(a => ({
                    symbol: a.symbol,
                    price: a.currentPrice
                }))
            });

            this.logger.log('Market prices updated and broadcasted.');
        } catch (error) {
            this.logger.error('Failed to update market prices', error.stack);
        }
    }

    // Initial update on startup
    async onModuleInit() {
        this.logger.log('MarketDataService initialized. Running initial price update...');
        await this.updateMarketPrices();
    }
}
