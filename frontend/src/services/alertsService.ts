import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface Alert {
    id: string;
    symbol: string;
    type: 'price_above' | 'price_below' | 'percent_change' | 'volume';
    targetValue: number;
    status: 'active' | 'triggered' | 'expired' | 'disabled';
    triggeredAt?: string;
    expiresAt?: string;
    message?: string;
    notifyEmail: boolean;
    notifyPush: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAlertDto {
    symbol: string;
    type: 'price_above' | 'price_below' | 'percent_change' | 'volume';
    targetValue: number;
    status?: 'active' | 'triggered' | 'expired' | 'disabled';
    expiresAt?: string;
    message?: string;
    notifyEmail?: boolean;
    notifyPush?: boolean;
}

class AlertsService {
    private getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    async getAll(): Promise<Alert[]> {
        const response = await axios.get(`${API_URL}/alerts`, this.getAuthHeaders());
        return response.data;
    }

    async getActive(): Promise<Alert[]> {
        const response = await axios.get(`${API_URL}/alerts/active`, this.getAuthHeaders());
        return response.data;
    }

    async getById(id: string): Promise<Alert> {
        const response = await axios.get(`${API_URL}/alerts/${id}`, this.getAuthHeaders());
        return response.data;
    }

    async create(data: CreateAlertDto): Promise<Alert> {
        const response = await axios.post(`${API_URL}/alerts`, data, this.getAuthHeaders());
        return response.data;
    }

    async update(id: string, data: Partial<CreateAlertDto>): Promise<Alert> {
        const response = await axios.patch(`${API_URL}/alerts/${id}`, data, this.getAuthHeaders());
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_URL}/alerts/${id}`, this.getAuthHeaders());
    }

    async trigger(id: string): Promise<Alert> {
        const response = await axios.post(`${API_URL}/alerts/${id}/trigger`, {}, this.getAuthHeaders());
        return response.data;
    }

    async getStats(): Promise<any> {
        const response = await axios.get(`${API_URL}/alerts/stats`, this.getAuthHeaders());
        return response.data;
    }
}

export const alertsService = new AlertsService();
