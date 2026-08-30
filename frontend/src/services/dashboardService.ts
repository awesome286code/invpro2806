import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface DashboardSummary {
    totalValue: number;
    totalCost: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    portfolioCount: number;
    assetCount: number;
}

export interface PerformanceData {
    timeRange: string;
    data: Array<{ date: string; value: number }>;
}

export interface TopPerformers {
    gainers: any[];
    losers: any[];
}

class DashboardService {
    private getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    async getSummary(): Promise<DashboardSummary> {
        const response = await axios.get(`${API_URL}/dashboard/summary`, this.getAuthHeaders());
        return response.data;
    }

    async getPerformance(timeRange: string = '1M'): Promise<PerformanceData> {
        const response = await axios.get(
            `${API_URL}/dashboard/performance?timeRange=${timeRange}`,
            this.getAuthHeaders()
        );
        return response.data;
    }

    async getTopPerformers(limit: number = 5): Promise<TopPerformers> {
        const response = await axios.get(
            `${API_URL}/dashboard/top-performers?limit=${limit}`,
            this.getAuthHeaders()
        );
        return response.data;
    }

    async getRecentActivity(limit: number = 10): Promise<any[]> {
        const response = await axios.get(
            `${API_URL}/dashboard/recent-activity?limit=${limit}`,
            this.getAuthHeaders()
        );
        return response.data;
    }
}

export const dashboardService = new DashboardService();
