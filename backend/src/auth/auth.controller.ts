import { Controller, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) { }

    @Post('login')
    async login(@Body() body: any) {
        const user = await this.authService.validateUser(body.email, body.password);
        return this.authService.generateTokens(user);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Initiates Google OAuth flow
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(@Req() req, @Res() res) {
        const user = req.user;
        const tokens = await this.authService.generateTokens(user);

        const frontendUrl = this.configService.get<string>('FRONTEND_URL');

        // Redirect to frontend with token
        res.redirect(`${frontendUrl}/callback?token=${tokens.accessToken}&user=${encodeURIComponent(JSON.stringify(tokens.user))}`);
    }

    @Get('status')
    getStatus() {
        return { status: 'Auth service is running' };
    }
}
