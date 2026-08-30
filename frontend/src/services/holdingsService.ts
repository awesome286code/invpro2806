import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface Holding {
    id: string;
    symbol: string;
    name: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    type: string;
    sector?: string;
    description?: string;
    totalValue: number;
    totalCost: number;
    gainLoss: number;
    gainLossPercent: number;
    currency: string;
    dailyOpenPrice: number;
    createdAt: string;
    updatedAt: string;
}

export interface HoldingTransaction {
    id: string;
    type: 'buy' | 'sell' | 'dividend' | 'split' | 'transfer' | 'fee';
    amount: number;
    quantity: number;
    price: number;
    fees: number;
    status: string;
    transactionDate: string;
    notes?: string;
    portfolioName?: string;
}

class HoldingsService {
    private getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    async getAll(portfolioId?: string, type?: string): Promise<Holding[]> {
        let url = `${API_URL}/holdings`;
        const params = new URLSearchParams();

        if (portfolioId) params.append('portfolioId', portfolioId);
        if (type) params.append('type', type);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await axios.get(url, this.getAuthHeaders());
        return response.data;
    }

    async getOne(id: string): Promise<Holding> {
        const response = await axios.get(`${API_URL}/holdings/${id}`, this.getAuthHeaders());
        return response.data;
    }

    async updatePrice(id: string, currentPrice: number): Promise<Holding> {
        const response = await axios.patch(
            `${API_URL}/holdings/${id}/price`,
            { currentPrice },
            this.getAuthHeaders()
        );
        return response.data;
    }

    async getTransactions(id: string): Promise<HoldingTransaction[]> {
        const response = await axios.get(
            `${API_URL}/holdings/${id}/transactions`,
            this.getAuthHeaders()
        );
        return response.data;
    }

    async addTransaction(id: string, transactionData: Partial<HoldingTransaction>): Promise<HoldingTransaction> {
        const response = await axios.post(
            `${API_URL}/holdings/${id}/transactions`,
            transactionData,
            this.getAuthHeaders()
        );
        return response.data;
    }

    async getBySymbol(symbol: string): Promise<AssetDetail> {
        const response = await axios.get(`${API_URL}/holdings/symbol/${symbol}`, this.getAuthHeaders());
        return response.data;
    }
}

export interface StockReport {
    id: string;
    title: string;
    summary: string;
    author: string;
    type: string;
    category: string;
    publishedDate: string;
    contentUrl?: string;
}

export interface AssetDetail {
    asset: any;
    holdings: any[];
    transactions: HoldingTransaction[];
    reports: StockReport[];
    metrics: {
        totalQuantity: number;
        totalCost: number;
        averagePrice: number;
        currentValue: number;
        gainLoss: number;
        gainLossPercent: number;
        dayChange: number;
        dayChangePercent: number;
    };
}

export const holdingsService = new HoldingsService();
