import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface PortfolioReport {
    summary: {
        totalValue: number;
        totalGainLoss: number;
        totalGainLossPercent: number;
        cagr: number;
        maxDrawdown: number;
        volatility: number;
        sharpeRatio: number;
    };
    allocation: {
        assetType: Array<{ type: string; value: number; percentage: number }>;
        sector: Array<{ sector: string; value: number; percentage: number }>;
    };
}

class ReportsService {
    private getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    async getPerformance(portfolioId?: string): Promise<any> {
        const url = portfolioId ? `${API_URL}/reports/performance?portfolioId=${portfolioId}` : `${API_URL}/reports/performance`;
        const response = await axios.get(url, this.getAuthHeaders());
        return response.data;
    }

    async getAdvancedAnalytics(userId: string): Promise<any> {
        const response = await axios.get(`${API_URL}/reports/advanced`, this.getAuthHeaders());
        return response.data;
    }
}

export const reportsService = new ReportsService();
