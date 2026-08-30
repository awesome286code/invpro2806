import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../services/socketService';

interface SocketContextType {
    isConnected: boolean;
    on: (event: string, callback: (data: any) => void) => void;
    off: (event: string, callback?: (data: any) => void) => void;
    emit: (event: string, data: any) => void;
    subscribeToMarketData: (symbols: string[]) => void;
    unsubscribeFromMarketData: (symbols: string[]) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

interface SocketProviderProps {
    children: React.ReactNode;
    userId?: string;
}

import { marketDataStream } from '../services/marketDataStream';

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, userId }) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (userId) {
            socketService.connect(userId);

            const handleConnect = () => setIsConnected(true);
            const handleDisconnect = () => setIsConnected(false);

            const handlePriceUpdate = (data: any) => {
                marketDataStream.pushTick(data);
            };

            const handlePricesUpdate = (data: any) => {
                if (data.assets && Array.isArray(data.assets)) {
                    data.assets.forEach((asset: any) => {
                        marketDataStream.pushTick({
                            symbol: asset.symbol,
                            price: asset.price,
                            timestamp: data.timestamp
                        });
                    });
                }
            };

            socketService.on('connect', handleConnect);
            socketService.on('disconnect', handleDisconnect);
            socketService.on('market:price_updated', handlePriceUpdate);
            socketService.on('market:prices_updated', handlePricesUpdate);

            setIsConnected(socketService.isConnected());

            return () => {
                socketService.off('connect', handleConnect);
                socketService.off('disconnect', handleDisconnect);
                socketService.off('market:price_updated', handlePriceUpdate);
                socketService.off('market:prices_updated', handlePricesUpdate);
                socketService.disconnect();
            };
        }
    }, [userId]);

    const value: SocketContextType = React.useMemo(() => ({
        isConnected,
        on: socketService.on.bind(socketService),
        off: socketService.off.bind(socketService),
        emit: socketService.emit.bind(socketService),
        subscribeToMarketData: socketService.subscribeToMarketData.bind(socketService),
        unsubscribeFromMarketData: socketService.unsubscribeFromMarketData.bind(socketService),
    }), [isConnected]);

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
