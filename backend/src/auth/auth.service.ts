import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async validateGoogleUser(profile: any): Promise<User> {
        const { id, emails, displayName, photos } = profile;
        const email = emails[0].value;
        const avatar = photos?.[0]?.value;

        let user = await this.userRepository.findOne({
            where: { googleId: id },
        });

        if (!user) {
            user = this.userRepository.create({
                googleId: id,
                email,
                name: displayName,
                avatar,
            });
            await this.userRepository.save(user);
        } else {
            // Update user info if changed
            user.name = displayName;
            user.avatar = avatar;
            await this.userRepository.save(user);
        }

        return user;
    }

    async generateTokens(user: User) {
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
            },
        };
    }

    async validateToken(token: string): Promise<any> {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            return null;
        }
    }

    async validateUser(email: string, pass: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.password) {
            // User exists but has no password (e.g. Google auth only)
            throw new UnauthorizedException('Use Google Login');
        }

        const isMatch = await bcrypt.compare(pass, user.password);
        if (isMatch) {
            return user;
        }

        throw new UnauthorizedException('Invalid credentials');
    }

    async getUserById(userId: string): Promise<User> {
        return this.userRepository.findOne({ where: { id: userId } });
    }
}
