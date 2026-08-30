import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

class AuthService {
    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        return response.data;
    }
}

export const authService = new AuthService();
