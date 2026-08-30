import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from '../entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Injectable()
export class AlertsService {
    constructor(
        @InjectRepository(Alert)
        private alertsRepository: Repository<Alert>,
    ) { }

    async create(userId: string, createAlertDto: CreateAlertDto): Promise<Alert> {
        const alert = this.alertsRepository.create({
            ...createAlertDto,
            userId,
            expiresAt: createAlertDto.expiresAt ? new Date(createAlertDto.expiresAt) : null,
        });

        return await this.alertsRepository.save(alert);
    }

    async findAll(userId: string): Promise<Alert[]> {
        return await this.alertsRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async findActive(userId: string): Promise<Alert[]> {
        return await this.alertsRepository.find({
            where: { userId, status: 'active' },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, userId: string): Promise<Alert> {
        const alert = await this.alertsRepository.findOne({
            where: { id, userId },
        });

        if (!alert) {
            throw new NotFoundException(`Alert with ID ${id} not found`);
        }

        return alert;
    }

    async update(id: string, userId: string, updateAlertDto: UpdateAlertDto): Promise<Alert> {
        const alert = await this.findOne(id, userId);

        Object.assign(alert, updateAlertDto);

        if (updateAlertDto.expiresAt) {
            alert.expiresAt = new Date(updateAlertDto.expiresAt);
        }

        return await this.alertsRepository.save(alert);
    }

    async remove(id: string, userId: string): Promise<void> {
        const alert = await this.findOne(id, userId);
        await this.alertsRepository.remove(alert);
    }

    async trigger(id: string, userId: string): Promise<Alert> {
        const alert = await this.findOne(id, userId);

        alert.status = 'triggered';
        alert.triggeredAt = new Date();

        return await this.alertsRepository.save(alert);
    }

    async getStats(userId: string): Promise<any> {
        const alerts = await this.findAll(userId);

        const stats = {
            total: alerts.length,
            active: alerts.filter(a => a.status === 'active').length,
            triggered: alerts.filter(a => a.status === 'triggered').length,
            expired: alerts.filter(a => a.status === 'expired').length,
            disabled: alerts.filter(a => a.status === 'disabled').length,
            byType: {} as Record<string, number>,
        };

        alerts.forEach(a => {
            stats.byType[a.type] = (stats.byType[a.type] || 0) + 1;
        });

        return stats;
    }
}
