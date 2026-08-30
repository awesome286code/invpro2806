import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from '../entities/user-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import * as crypto from 'crypto';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(UserSettings)
        private settingsRepository: Repository<UserSettings>,
    ) { }

    async findOrCreate(userId: string): Promise<UserSettings> {
        let settings = await this.settingsRepository.findOne({
            where: { userId },
        });

        if (!settings) {
            settings = this.settingsRepository.create({ userId });
            settings = await this.settingsRepository.save(settings);
        }

        return settings;
    }

    async update(userId: string, updateSettingsDto: UpdateSettingsDto): Promise<UserSettings> {
        const settings = await this.findOrCreate(userId);
        Object.assign(settings, updateSettingsDto);
        return await this.settingsRepository.save(settings);
    }

    async generateApiKey(userId: string): Promise<{ apiKey: string }> {
        const settings = await this.findOrCreate(userId);
        const apiKey = crypto.randomBytes(32).toString('hex');
        settings.apiKey = apiKey;
        await this.settingsRepository.save(settings);
        return { apiKey };
    }

    async revokeApiKey(userId: string): Promise<void> {
        const settings = await this.findOrCreate(userId);
        settings.apiKey = null;
        await this.settingsRepository.save(settings);
    }
}
