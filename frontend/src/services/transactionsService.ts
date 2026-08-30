import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface Transaction {
    id: string;
    type: 'buy' | 'sell' | 'dividend' | 'split' | 'transfer' | 'fee' | 'deposit' | 'withdraw';
    amount: number;
    quantity?: number;
    price?: number;
    fees: number;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    transactionDate: string;
    notes?: string;
    symbol?: string;
    investmentId?: string;
    portfolioId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTransactionDto {
    type: 'buy' | 'sell' | 'dividend' | 'split' | 'transfer' | 'fee' | 'deposit' | 'withdraw';
    amount: number;
    quantity?: number;
    price?: number;
    fees?: number;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    transactionDate?: string;
    notes?: string;
    symbol?: string;
    assetName?: string;
    investmentId?: string;
    portfolioId?: string;
}

class TransactionsService {
    private getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    async getAll(): Promise<Transaction[]> {
        const response = await axios.get(`${API_URL}/transactions`, this.getAuthHeaders());
        return response.data;
    }

    async getById(id: string): Promise<Transaction> {
        const response = await axios.get(`${API_URL}/transactions/${id}`, this.getAuthHeaders());
        return response.data;
    }

    async create(data: CreateTransactionDto): Promise<Transaction> {
        const response = await axios.post(`${API_URL}/transactions`, data, this.getAuthHeaders());
        return response.data;
    }

    async update(id: string, data: Partial<CreateTransactionDto>): Promise<Transaction> {
        const response = await axios.patch(`${API_URL}/transactions/${id}`, data, this.getAuthHeaders());
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_URL}/transactions/${id}`, this.getAuthHeaders());
    }

    async getStats(): Promise<any> {
        const response = await axios.get(`${API_URL}/transactions/stats`, this.getAuthHeaders());
        return response.data;
    }
}

export const transactionsService = new TransactionsService();
