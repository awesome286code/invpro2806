import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Investment } from './investment.entity';

@Entity('portfolios')
export class Portfolio {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { eager: false })
    user: User;

    @Column()
    userId: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: 'active' })
    status: 'active' | 'archived';

    @Column({ nullable: true })
    color: string;

    @Column({ nullable: true })
    icon: string;

    @Column({ nullable: true })
    objective: 'growth' | 'income' | 'capital_preservation' | 'speculation';

    @Column({ nullable: true })
    timeHorizon: 'short' | 'mid' | 'long';

    @Column({ nullable: true })
    riskProfile: 'conservative' | 'balanced' | 'aggressive';

    @Column({ default: 'USD' })
    baseCurrency: string;

    @Column({ nullable: true })
    benchmark: string;

    @OneToMany(() => Investment, investment => investment.portfolio)
    investments: Investment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
