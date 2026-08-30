import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface Portfolio {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'archived';
    color?: string;
    icon?: string;
    objective?: 'growth' | 'income' | 'capital_preservation' | 'speculation';
    timeHorizon?: 'short' | 'mid' | 'long';
    riskProfile?: 'conservative' | 'balanced' | 'aggressive';
    baseCurrency?: string;
    benchmark?: string;
    createdAt: string;
    updatedAt: string;
    investments?: any[];
    // Computed fields
    totalValue?: number;
    totalGainLoss?: number;
    totalGainLossPercent?: number;
    allocations?: Array<{
        id: string;
        label: string;
        value: number;
        color: string;
    }>;
}

export interface CreatePortfolioDto {
    name: string;
    description?: string;
    status?: 'active' | 'archived';
    color?: string;
    icon?: string;
    objective?: 'growth' | 'income' | 'capital_preservation' | 'speculation';
    timeHorizon?: 'short' | 'mid' | 'long';
    riskProfile?: 'conservative' | 'balanced' | 'aggressive';
    baseCurrency?: string;
    benchmark?: string;
}

export interface PortfolioHoldings {
    portfolio: {
        id: string;
        name: string;
        description?: string;
    };
    holdings: Array<{
        id: string;
        symbol: string;
        name: string;
        quantity: number;
        averagePrice: number;
        currentPrice: number;
        totalValue: number;
        totalCost: number;
        gainLoss: number;
        gainLossPercent: number;
    }>;
    summary: {
        totalValue: number;
        totalCost: number;
        totalGainLoss: number;
        totalGainLossPercent: number;
        count: number;
    };
}

class PortfoliosService {
    private getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    async getAll(): Promise<Portfolio[]> {
        const response = await axios.get(`${API_URL}/portfolios`, this.getAuthHeaders());
        return response.data;
    }

    async getById(id: string): Promise<Portfolio> {
        const response = await axios.get(`${API_URL}/portfolios/${id}`, this.getAuthHeaders());
        return response.data;
    }

    async getHoldings(id: string): Promise<PortfolioHoldings> {
        const response = await axios.get(`${API_URL}/portfolios/${id}/holdings`, this.getAuthHeaders());
        return response.data;
    }

    async create(data: CreatePortfolioDto): Promise<Portfolio> {
        const response = await axios.post(`${API_URL}/portfolios`, data, this.getAuthHeaders());
        return response.data;
    }

    async update(id: string, data: Partial<CreatePortfolioDto>): Promise<Portfolio> {
        const response = await axios.patch(`${API_URL}/portfolios/${id}`, data, this.getAuthHeaders());
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_URL}/portfolios/${id}`, this.getAuthHeaders());
    }
}

export const portfoliosService = new PortfoliosService();
