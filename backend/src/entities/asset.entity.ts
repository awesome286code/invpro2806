import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Investment } from './investment.entity';

@Entity('assets')
export class Asset {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    symbol: string;

    @Column()
    name: string;

    @Column({ default: 'stock' })
    type: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'current_price' })
    currentPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'daily_open_price', nullable: true })
    dailyOpenPrice: number;

    @Column({ default: 'USD' })
    currency: string;

    @Column({ nullable: true })
    logo: string;

    @Column({ nullable: true })
    sector: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    volume: number;

    @Column({ default: 'medium', name: 'risk_level' })
    riskLevel: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => Investment, investment => investment.asset)
    investments: Investment[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
