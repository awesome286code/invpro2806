import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
import { InvestmentService } from './investment.service';
import { TransactionsService } from '../transactions/transactions.service';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: {
        origin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedClients = new Map<string, Socket>();

    constructor(
        private investmentService: InvestmentService,
        private transactionsService: TransactionsService,
        private configService: ConfigService,
    ) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.connectedClients.delete(client.id);
    }

    // Authentication event - client sends token to authenticate
    @SubscribeMessage('authenticate')
    async handleAuthenticate(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { token: string },
    ) {
        try {
            // The WsAuthGuard will be applied to protected events
            // For now, just acknowledge the authentication
            this.connectedClients.set(client.id, client);

            return {
                event: 'authenticated',
                data: { success: true, message: 'Authentication successful' },
            };
        } catch (error) {
            throw new WsException('Authentication failed');
        }
    }

    // ==================== MARKET DATA ====================

    @SubscribeMessage('market:subscribe')
    handleMarketSubscribe(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { symbols: string[] },
    ) {
        const { symbols } = data;
        if (symbols && Array.isArray(symbols)) {
            symbols.forEach(symbol => {
                client.join(`market:${symbol}`);
                console.log(`[Socket] Client ${client.id} joined room: market:${symbol}`);
            });
        }
        return { event: 'market:subscribed', data: { symbols } };
    }

    @SubscribeMessage('market:unsubscribe')
    handleMarketUnsubscribe(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { symbols: string[] },
    ) {
        const { symbols } = data;
        if (symbols && Array.isArray(symbols)) {
            symbols.forEach(symbol => {
                client.leave(`market:${symbol}`);
                console.log(`Client ${client.id} unsubscribed from ${symbol}`);
            });
        }
        return { event: 'market:unsubscribed', data: { symbols } };
    }

    // ==================== INVESTMENTS ====================

    // Get all investments for the authenticated user
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('investments:get')
    async handleGetInvestments(@ConnectedSocket() client: Socket & { user: any }) {
        try {
            const investments = await this.investmentService.getUserInvestments(client.user.id);

            return {
                event: 'investments:list',
                data: investments,
            };
        } catch (error) {
            throw new WsException(error.message || 'Failed to fetch investments');
        }
    }

    // Create a new investment
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('investments:create')
    async handleCreateInvestment(
        @ConnectedSocket() client: Socket & { user: any },
        @MessageBody() data: any,
    ) {
        try {
            const investment = await this.investmentService.createInvestment(client.user.id, data);

            // Broadcast to the user
            client.emit('investments:created', investment);

            return {
                event: 'investments:created',
                data: investment,
            };
        } catch (error) {
            throw new WsException(error.message || 'Failed to create investment');
        }
    }

    // Update an existing investment
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('investments:update')
    async handleUpdateInvestment(
        @ConnectedSocket() client: Socket & { user: any },
        @MessageBody() data: { id: string; updates: any },
    ) {
        try {
            const investment = await this.investmentService.updateInvestment(
                data.id,
                client.user.id,
                data.updates,
            );

            client.emit('investments:updated', investment);

            return {
                event: 'investments:updated',
                data: investment,
            };
        } catch (error) {
            throw new WsException(error.message || 'Failed to update investment');
        }
    }

    // Delete an investment
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('investments:delete')
    async handleDeleteInvestment(
        @ConnectedSocket() client: Socket & { user: any },
        @MessageBody() data: { id: string },
    ) {
        try {
            await this.investmentService.deleteInvestment(data.id, client.user.id);

            client.emit('investments:deleted', { id: data.id });

            return {
                event: 'investments:deleted',
                data: { id: data.id, success: true },
            };
        } catch (error) {
            throw new WsException(error.message || 'Failed to delete investment');
        }
    }

    // Get a single investment by ID
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('investments:getById')
    async handleGetInvestmentById(
        @ConnectedSocket() client: Socket & { user: any },
        @MessageBody() data: { id: string },
    ) {
        try {
            const investment = await this.investmentService.getInvestmentById(data.id, client.user.id);

            if (!investment) {
                throw new WsException('Investment not found');
            }

            return {
                event: 'investments:detail',
                data: investment,
            };
        } catch (error) {
            throw new WsException(error.message || 'Failed to fetch investment');
        }
    }

    // ==================== TRANSACTIONS ====================

    // Get all transactions
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('transactions:get')
    async handleGetTransactions(@ConnectedSocket() client: Socket & { user: any }) {
        try {
            const transactions = await this.transactionsService.findAll(client.user.id);

            return {
                event: 'transactions:list',
                data: transactions,
            };
        } catch (error) {
            throw new WsException(error.message || 'Failed to fetch transactions');
        }
    }

    // Create a new transaction
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('transactions:create')
    async handleCreateTransaction(
        @ConnectedSocket() client: Socket & { user: any },
        @MessageBody() data: any,
    ) {
        try {
            const transaction = await this.transactionsService.create(client.user.id, data);

            client.emit('transactions:created', transaction);

            return {
                event: 'transactions:created',
                data: transaction,
            };
        } catch (error) {
            throw new WsException(error.message || 'Failed to create transaction');
        }
    }

    // Update a transaction
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('transactions:update')
    async handleUpdateTransaction(
        @ConnectedSocket() client: Socket & { user: any },
        @MessageBody() data: { id: string; updates: any },
    ) {
        try {
            const transaction = await this.transactionsService.update(
                data.id,
                client.user.id,
                data.updates,
            );

            client.emit('transactions:updated', transaction);

            return {
                event: 'transactions:updated',
                data: transaction,
            };
        } catch (error) {
            throw new WsException(error.message || 'Failed to update transaction');
        }
    }

    // Delete a transaction
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('transactions:delete')
    async handleDeleteTransaction(
        @ConnectedSocket() client: Socket & { user: any },
        @MessageBody() data: { id: string },
    ) {
        try {
            await this.transactionsService.remove(data.id, client.user.id);

            client.emit('transactions:deleted', { id: data.id });

            return {
                event: 'transactions:deleted',
                data: { id: data.id, success: true },
            };
        } catch (error) {
            throw new WsException(error.message || 'Failed to delete transaction');
        }
    }

    // Get transaction stats
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('transactions:stats')
    async handleGetTransactionStats(@ConnectedSocket() client: Socket & { user: any }) {
        try {
            const stats = await this.transactionsService.getStats(client.user.id);

            return {
                event: 'transactions:stats',
                data: stats,
            };
        } catch (error) {
            throw new WsException(error.message || 'Failed to fetch transaction stats');
        }
    }

    // Ping/Pong for connection health check
    @SubscribeMessage('ping')
    handlePing(@ConnectedSocket() client: Socket) {
        return {
            event: 'pong',
            data: { timestamp: Date.now() },
        };
    }
}
