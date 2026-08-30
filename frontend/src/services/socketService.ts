import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

class SocketService {
    private socket: Socket | null = null;
    private userId: string | null = null;

    connect(userId: string) {
        if (this.socket?.connected) {
            return;
        }

        this.userId = userId;
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
            if (this.userId) {
                this.socket?.emit('subscribe:user', { userId: this.userId });
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            if (this.userId) {
                this.socket.emit('unsubscribe:user', { userId: this.userId });
            }
            this.socket.disconnect();
            this.socket = null;
            this.userId = null;
        }
    }

    on(event: string, callback: (data: any) => void) {
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (data: any) => void) {
        this.socket?.off(event, callback);
    }

    emit(event: string, data: any) {
        this.socket?.emit(event, data);
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    subscribeToMarketData(symbols: string[]) {
        if (symbols.length > 0) {
            this.emit('market:subscribe', { symbols });
        }
    }

    unsubscribeFromMarketData(symbols: string[]) {
        if (symbols.length > 0) {
            this.emit('market:unsubscribe', { symbols });
        }
    }
}

export const socketService = new SocketService();
