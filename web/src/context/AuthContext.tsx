import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'SUPERVISOR' | 'INTERVIEWER' | 'CLIENT';
    mustChangePassword?: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User, rememberMe?: boolean) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage first (persistent), then sessionStorage
        let storedToken = localStorage.getItem('token');
        let storedUser = localStorage.getItem('user');

        if (!storedToken || !storedUser) {
            storedToken = sessionStorage.getItem('token');
            storedUser = sessionStorage.getItem('user');
        }

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (newToken: string, newUser: User, rememberMe: boolean = false) => {
        if (rememberMe) {
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            sessionStorage.setItem('token', newToken);
            sessionStorage.setItem('user', JSON.stringify(newUser));
        }
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
