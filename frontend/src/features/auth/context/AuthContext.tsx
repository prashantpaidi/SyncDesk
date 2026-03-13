import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
    token: string | null;
    role: string | null;
    userId: number | null;
    userName: string | null;
    isAuthenticated: boolean;
    login: (token: string, role: string, userId: number, userName: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("token");
    });
    const [role, setRole] = useState<string | null>(() => {
        return localStorage.getItem("role");
    });
    const [userId, setUserId] = useState<number | null>(() => {
        const stored = localStorage.getItem("userId");
        return stored ? parseInt(stored, 10) : null;
    });
    const [userName, setUserName] = useState<string | null>(() => {
        return localStorage.getItem("userName");
    });

    const login = (newToken: string, newRole: string, newUserId: number, newUserName: string) => {
        setToken(newToken);
        setRole(newRole);
        setUserId(newUserId);
        setUserName(newUserName);
        localStorage.setItem("token", newToken);
        localStorage.setItem("role", newRole);
        localStorage.setItem("userId", newUserId.toString());
        localStorage.setItem("userName", newUserName);
    };

    const logout = () => {
        setToken(null);
        setRole(null);
        setUserId(null);
        setUserName(null);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
    };

    const isAuthenticated = !!token;

    useEffect(() => {
        const handleUnauthorized = () => {
            logout();
        };
        window.addEventListener('unauthorized', handleUnauthorized);
        return () => window.removeEventListener('unauthorized', handleUnauthorized);
    }, []);

    return (
        <AuthContext.Provider value={{ token, role, userId, userName, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
