import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Portfolio } from './portfolio.entity';
import { Asset } from './asset.entity';

@Entity('investments')
export class Investment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User, user => user.investments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'portfolio_id', nullable: true })
    portfolioId: string;

    @ManyToOne(() => Portfolio, portfolio => portfolio.investments, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'portfolio_id' })
    portfolio: Portfolio;

    @Column({ name: 'asset_id' })
    assetId: string;

    @ManyToOne(() => Asset, asset => asset.investments, { eager: true })
    @JoinColumn({ name: 'asset_id' })
    asset: Asset;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'average_price' })
    averagePrice: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
