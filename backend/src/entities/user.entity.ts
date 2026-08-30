import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column({ unique: true, name: 'google_id', nullable: true })
    googleId: string;

    @Column({ nullable: true })
    password: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ nullable: true, name: 'access_token' })
    accessToken: string;

    @Column({ nullable: true, name: 'refresh_token' })
    refreshToken: string;

    @OneToMany('Investment', 'user')
    investments: any[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
