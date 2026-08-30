import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../entities/asset.entity';

@Injectable()
export class AssetsService {
    constructor(
        @InjectRepository(Asset)
        private assetsRepository: Repository<Asset>,
    ) { }

    async findAll(): Promise<Asset[]> {
        return await this.assetsRepository.find({
            order: { symbol: 'ASC' },
        });
    }

    async findByType(type: string): Promise<Asset[]> {
        return await this.assetsRepository.find({
            where: { type },
            order: { symbol: 'ASC' },
        });
    }

    async findByTypeAndCurrency(type: string, currency: string): Promise<Asset[]> {
        return await this.assetsRepository.find({
            where: { type, currency },
            order: { symbol: 'ASC' },
        });
    }

    async findBySymbol(symbol: string): Promise<Asset | null> {
        return await this.assetsRepository.findOne({
            where: { symbol },
        });
    }

    async create(assetData: Partial<Asset>): Promise<Asset> {
        const asset = this.assetsRepository.create(assetData);
        return await this.assetsRepository.save(asset);
    }
}
