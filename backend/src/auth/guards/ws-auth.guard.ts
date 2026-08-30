import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from '../auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
    constructor(private authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context.switchToWs().getClient();
            const token = client.handshake?.auth?.token || client.handshake?.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                throw new WsException('Unauthorized: No token provided');
            }

            const payload = await this.authService.validateToken(token);

            if (!payload) {
                throw new WsException('Unauthorized: Invalid token');
            }

            const user = await this.authService.getUserById(payload.sub);

            if (!user) {
                throw new WsException('Unauthorized: User not found');
            }

            // Attach user to client for use in handlers
            client.user = user;

            return true;
        } catch (error) {
            throw new WsException('Unauthorized');
        }
    }
}
