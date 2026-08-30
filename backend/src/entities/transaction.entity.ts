import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Investment } from './investment.entity';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { eager: false })
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Investment, { eager: false, nullable: true })
    investment: Investment;

    @Column({ nullable: true })
    investmentId: string;

    @Column()
    type: 'buy' | 'sell' | 'dividend' | 'split' | 'transfer' | 'fee' | 'deposit' | 'withdraw';

    @Column('decimal', { precision: 15, scale: 2 })
    amount: number;

    @Column('decimal', { precision: 15, scale: 6, nullable: true })
    quantity: number;

    @Column('decimal', { precision: 15, scale: 2, nullable: true })
    price: number;

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    fees: number;

    @Column({ default: 'completed' })
    status: 'pending' | 'completed' | 'failed' | 'cancelled';

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    transactionDate: Date;

    @Column({ nullable: true })
    notes: string;

    @Column({ nullable: true })
    symbol: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
