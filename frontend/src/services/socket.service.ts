import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private token: string | null = null;

    connect(token?: string) {
        if (this.socket?.connected) {
            return this.socket;
        }

        if (token) {
            this.token = token;
        }

        this.socket = io('http://localhost:3001', {
            auth: {
                token: this.token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to Socket.IO server');

            // Authenticate if we have a token
            if (this.token) {
                this.emit('authenticate', { token: this.token });
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from Socket.IO server:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        this.socket.on('authenticated', (data) => {
            console.log('🔐 Authenticated:', data);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event: string, data?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                reject(new Error('Socket not connected'));
                return;
            }

            this.socket.timeout(10000).emit(event, data, (err: any, response: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });
    }

    on(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event: string, callback?: (data: any) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    setToken(token: string) {
        this.token = token;
        if (this.socket?.connected) {
            this.emit('authenticate', { token });
        }
    }
}

export const socketService = new SocketService();
export default socketService;
