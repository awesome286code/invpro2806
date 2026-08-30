import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

export interface MarketData {
    symbol: string;
    price: number;
    volume?: number;
    dailyOpenPrice?: number;
    currency?: string;
    timestamp: string;
}

export function useMarketData(symbols: string[]) {
    const { on, off, subscribeToMarketData, unsubscribeFromMarketData, isConnected } = useSocket();
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [volumes, setVolumes] = useState<Record<string, number>>({});
    const [dailyOpenPrices, setDailyOpenPrices] = useState<Record<string, number>>({});
    const [currencies, setCurrencies] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isConnected || symbols.length === 0) return;

        // Subscribe to symbols
        subscribeToMarketData(symbols);

        const handlePriceUpdate = (data: Partial<MarketData> & { symbol: string }) => {
            if (!symbols.includes(data.symbol)) return;

            setPrices(prev => data.price !== undefined && prev[data.symbol] !== data.price ? { ...prev, [data.symbol]: data.price } : prev);

            if (data.volume !== undefined) {
                setVolumes(prev => prev[data.symbol] !== data.volume ? { ...prev, [data.symbol]: data.volume! } : prev);
            }
            if (data.dailyOpenPrice !== undefined) {
                setDailyOpenPrices(prev => prev[data.symbol] !== data.dailyOpenPrice ? { ...prev, [data.symbol]: data.dailyOpenPrice! } : prev);
            }
            if (data.currency !== undefined) {
                setCurrencies(prev => prev[data.symbol] !== data.currency ? { ...prev, [data.symbol]: data.currency! } : prev);
            }
        };

        // Listen for individual price updates
        on('market:price_updated', handlePriceUpdate);

        return () => {
            // Unsubscribe from symbols
            off('market:price_updated', handlePriceUpdate);
            unsubscribeFromMarketData(symbols);
        };
    }, [symbols, on, off, subscribeToMarketData, unsubscribeFromMarketData, isConnected]);

    return { prices, volumes, dailyOpenPrices, currencies };
}
