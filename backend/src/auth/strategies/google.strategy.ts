import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || process.env.GOOGLE_CLIENT_ID || 'MISSING_GOOGLE_CLIENT_ID',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || process.env.GOOGLE_CLIENT_SECRET || 'MISSING_GOOGLE_CLIENT_SECRET',
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000',
            scope: ['email', 'profile'],
        });

        const clientID = configService.get<string>('GOOGLE_CLIENT_ID') || process.env.GOOGLE_CLIENT_ID;
        if (!clientID) {
            console.error('CRITICAL: GOOGLE_CLIENT_ID is not defined in the environment variables!');
        }
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const user = await this.authService.validateGoogleUser(profile);
        done(null, user);
    }
}
