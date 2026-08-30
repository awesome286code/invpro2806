import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('alerts')
export class Alert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { eager: false })
    user: User;

    @Column()
    userId: string;

    @Column()
    symbol: string;

    @Column()
    type: 'price_above' | 'price_below' | 'percent_change' | 'volume';

    @Column('decimal', { precision: 15, scale: 2 })
    targetValue: number;

    @Column({ default: 'active' })
    status: 'active' | 'triggered' | 'expired' | 'disabled';

    @Column({ type: 'timestamp', nullable: true })
    triggeredAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    expiresAt: Date;

    @Column({ nullable: true })
    message: string;

    @Column({ default: true })
    notifyEmail: boolean;

    @Column({ default: true })
    notifyPush: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
