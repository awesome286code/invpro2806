import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { socketService } from '../services/socketService';

interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored auth data on mount
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(userData);

                // Connect to Socket.IO with user ID
                socketService.connect(userData.id);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
        }

        setIsLoading(false);
    }, []);

    const login = (authToken: string, userData: User) => {
        setToken(authToken);
        setUser(userData);

        // Store in localStorage
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));

        // Connect to Socket.IO with user ID
        socketService.connect(userData.id);
    };

    const logout = () => {
        setToken(null);
        setUser(null);

        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        // Disconnect from Socket.IO
        socketService.disconnect();
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
