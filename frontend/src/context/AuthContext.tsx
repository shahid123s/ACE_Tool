import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/api';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await authService.me();
                    setUser(data.user);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const { data } = await authService.login({ email, password });
            console.log(data, 'debuggin  src/context/AuthContext.jsx');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setUser(data.user);
            toast.success('Successfully logged in');
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.info('Logged out');
        window.location.href = '/login';
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
