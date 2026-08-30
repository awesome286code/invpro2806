import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDataService } from './market-data.service';
import { Asset } from '../entities/asset.entity';
import { SocketModule } from '../socket/socket.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Asset]),
        SocketModule,
    ],
    providers: [MarketDataService],
    exports: [MarketDataService],
})
export class MarketDataModule { }
