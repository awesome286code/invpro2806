import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('cashflow_snapshots')
export class CashFlowSnapshot {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_invested' })
    totalInvested: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_dividends' })
    totalDividends: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_fees' })
    totalFees: number;

    @Column({ type: 'date' })
    date: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
