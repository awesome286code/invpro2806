import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('portfolio_snapshots')
export class PortfolioSnapshot {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_value' })
    totalValue: number;

    @Column({ type: 'date' })
    date: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
