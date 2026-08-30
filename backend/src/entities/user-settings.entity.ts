import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    UpdateDateColumn,
    CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_settings')
export class UserSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, { eager: false })
    @JoinColumn()
    user: User;

    @Column()
    userId: string;

    // Notifications
    @Column({ default: true })
    emailNotifications: boolean;

    @Column({ default: true })
    pushNotifications: boolean;

    @Column({ default: true })
    priceAlerts: boolean;

    @Column({ default: true })
    portfolioUpdates: boolean;

    @Column({ default: true })
    newsUpdates: boolean;

    // Preferences
    @Column({ default: 'USD' })
    currency: string;

    @Column({ default: 'en' })
    language: string;

    @Column({ default: 'dark' })
    theme: string;

    @Column({ default: 'America/New_York' })
    timezone: string;

    // Investment Profile
    @Column({ nullable: true })
    riskTolerance: string;

    @Column({ nullable: true })
    investmentExperience: string;

    @Column({ nullable: true })
    investmentGoals: string;

    // Privacy & Security
    @Column({ default: false })
    twoFactorEnabled: boolean;

    @Column({ nullable: true })
    apiKey: string;

    @Column({ default: true })
    profilePublic: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
