import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Asset } from './asset.entity';

@Entity('stock_reports')
export class StockReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    summary: string;

    @Column({ nullable: true })
    contentUrl: string;

    @Column()
    author: string;

    @Column()
    symbol: string;

    @Column({ default: 'report' }) // 'report' or 'news'
    type: string;

    @Column({ default: 'Economy' })
    category: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    publishedDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Asset)
    @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
    asset: Asset;
}
