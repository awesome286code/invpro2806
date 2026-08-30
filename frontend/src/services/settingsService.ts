import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface UserSettings {
    id: string;
    // Notifications
    emailNotifications: boolean;
    pushNotifications: boolean;
    priceAlerts: boolean;
    portfolioUpdates: boolean;
    newsUpdates: boolean;
    // Preferences
    currency: string;
    language: string;
    theme: string;
    timezone: string;
    // Investment Profile
    riskTolerance?: string;
    investmentExperience?: string;
    investmentGoals?: string;
    // Privacy & Security
    twoFactorEnabled: boolean;
    apiKey?: string;
    profilePublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateSettingsDto {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    priceAlerts?: boolean;
    portfolioUpdates?: boolean;
    newsUpdates?: boolean;
    currency?: string;
    language?: string;
    theme?: string;
    timezone?: string;
    riskTolerance?: string;
    investmentExperience?: string;
    investmentGoals?: string;
    twoFactorEnabled?: boolean;
    profilePublic?: boolean;
}

class SettingsService {
    private getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    async get(): Promise<UserSettings> {
        const response = await axios.get(`${API_URL}/settings`, this.getAuthHeaders());
        return response.data;
    }

    async update(data: UpdateSettingsDto): Promise<UserSettings> {
        const response = await axios.put(`${API_URL}/settings`, data, this.getAuthHeaders());
        return response.data;
    }

    async generateApiKey(): Promise<{ apiKey: string }> {
        const response = await axios.post(`${API_URL}/settings/api-key`, {}, this.getAuthHeaders());
        return response.data;
    }

    async revokeApiKey(): Promise<void> {
        await axios.delete(`${API_URL}/settings/api-key`, this.getAuthHeaders());
    }
}

export const settingsService = new SettingsService();
