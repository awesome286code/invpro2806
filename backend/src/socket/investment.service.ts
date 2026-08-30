import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from '../entities/investment.entity';

@Injectable()
export class InvestmentService {
    constructor(
        @InjectRepository(Investment)
        private investmentRepository: Repository<Investment>,
    ) { }

    async getUserInvestments(userId: string): Promise<Investment[]> {
        return this.investmentRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async createInvestment(userId: string, data: Partial<Investment>): Promise<Investment> {
        const investment = this.investmentRepository.create({
            ...data,
            userId,
        });
        return this.investmentRepository.save(investment);
    }

    async updateInvestment(id: string, userId: string, data: Partial<Investment>): Promise<Investment> {
        const investment = await this.investmentRepository.findOne({
            where: { id, userId },
        });

        if (!investment) {
            throw new Error('Investment not found');
        }

        Object.assign(investment, data);
        return this.investmentRepository.save(investment);
    }

    async deleteInvestment(id: string, userId: string): Promise<void> {
        const result = await this.investmentRepository.delete({ id, userId });

        if (result.affected === 0) {
            throw new Error('Investment not found');
        }
    }

    async getInvestmentById(id: string, userId: string): Promise<Investment> {
        return this.investmentRepository.findOne({
            where: { id, userId },
        });
    }
}
