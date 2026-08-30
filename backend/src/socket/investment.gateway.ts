import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:80'],
        credentials: true,
    },
})
export class InvestmentGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets: Map<string, Set<string>> = new Map();

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);

        // Remove client from all user subscriptions
        this.userSockets.forEach((sockets, userId) => {
            sockets.delete(client.id);
            if (sockets.size === 0) {
                this.userSockets.delete(userId);
            }
        });
    }

    @SubscribeMessage('subscribe:user')
    handleSubscribeUser(
        @MessageBody() data: { userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { userId } = data;

        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }

        this.userSockets.get(userId)!.add(client.id);

        return { event: 'subscribed', data: { userId } };
    }

    @SubscribeMessage('unsubscribe:user')
    handleUnsubscribeUser(
        @MessageBody() data: { userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { userId } = data;

        if (this.userSockets.has(userId)) {
            this.userSockets.get(userId)!.delete(client.id);
            if (this.userSockets.get(userId)!.size === 0) {
                this.userSockets.delete(userId);
            }
        }

        return { event: 'unsubscribed', data: { userId } };
    }

    // Emit events to specific user
    emitToUser(userId: string, event: string, data: any) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            sockets.forEach(socketId => {
                this.server.to(socketId).emit(event, data);
            });
        }
    }

    // Event emitters for different actions
    portfolioUpdated(userId: string, portfolio: any) {
        this.emitToUser(userId, 'portfolio:updated', portfolio);
    }

    holdingPriceUpdated(userId: string, holding: any) {
        this.emitToUser(userId, 'holding:price-updated', holding);
    }

    transactionCreated(userId: string, transaction: any) {
        this.emitToUser(userId, 'transaction:created', transaction);
    }

    dashboardRefresh(userId: string) {
        this.emitToUser(userId, 'dashboard:refresh', { timestamp: new Date() });
    }
}
