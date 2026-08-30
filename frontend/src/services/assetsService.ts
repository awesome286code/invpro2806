import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface Asset {
    id: string;
    symbol: string;
    name: string;
    type: string;
    currentPrice: number;
    currency: string;
    logo?: string;
    sector?: string;
    description?: string;
}

class AssetsService {
    private getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    async getAll(): Promise<Asset[]> {
        const response = await axios.get(`${API_URL}/assets`, this.getAuthHeaders());
        return Array.isArray(response.data) ? response.data : [];
    }

    async getByType(type: string, currency?: string): Promise<Asset[]> {
        let url = `${API_URL}/assets/by-type/${type}`;
        if (currency) {
            url += `?currency=${currency}`;
        }
        console.log('[AssetsService] Fetching from URL:', url);
        const response = await axios.get(url, this.getAuthHeaders());
        console.log('[AssetsService] Response status:', response.status);
        console.log('[AssetsService] Response data:', response.data);
        console.log('[AssetsService] Is array?', Array.isArray(response.data));
        return Array.isArray(response.data) ? response.data : [];
    }

    async getBySymbol(symbol: string): Promise<Asset | null> {
        const response = await axios.get(`${API_URL}/assets/symbol/${symbol}`, this.getAuthHeaders());
        return response.data;
    }

    async create(assetData: Partial<Asset>): Promise<Asset> {
        const response = await axios.post(`${API_URL}/assets`, assetData, this.getAuthHeaders());
        return response.data;
    }
}

export const assetsService = new AssetsService();
