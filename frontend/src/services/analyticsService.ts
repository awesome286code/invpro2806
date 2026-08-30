import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface PortfolioAnalytics {
    totalValue: number;
    totalCost: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    investmentCount: number;
}

export interface PerformanceMetrics {
    totalInvested: number;
    currentValue: number;
    totalDividends: number;
    totalFees: number;
    netReturn: number;
    netReturnPercent: number;
    transactionCount: number;
}

export interface AssetAllocation {
    allocation: Array<{
        type: string;
        value: number;
        count: number;
        percentage: number;
    }>;
    totalValue: number;
}

export interface HistoricalData {
    period: string;
    data: Array<{
        date: string;
        value: number;
    }>;
}

class AnalyticsService {
    private getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    async getPortfolioAnalytics(): Promise<PortfolioAnalytics> {
        const response = await axios.get(`${API_URL}/analytics/portfolio`, this.getAuthHeaders());
        return response.data;
    }

    async getPerformanceMetrics(): Promise<PerformanceMetrics> {
        const response = await axios.get(`${API_URL}/analytics/performance`, this.getAuthHeaders());
        return response.data;
    }

    async getAssetAllocation(): Promise<AssetAllocation> {
        const response = await axios.get(`${API_URL}/analytics/allocation`, this.getAuthHeaders());
        return response.data;
    }

    async getHistoricalData(days: number = 30): Promise<HistoricalData> {
        const response = await axios.get(`${API_URL}/analytics/history?days=${days}`, this.getAuthHeaders());
        return response.data;
    }

    async getRiskDistribution(): Promise<{ low: number; medium: number; high: number; totalValue: number }> {
        const response = await axios.get(`${API_URL}/analytics/risk-distribution`, this.getAuthHeaders());
        return response.data;
    }
}

export const analyticsService = new AnalyticsService();
