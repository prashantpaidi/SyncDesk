import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
    token: string | null;
    role: string | null;
    isAuthenticated: boolean;
    login: (token: string, role: string) => void;
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

    const login = (newToken: string, newRole: string) => {
        setToken(newToken);
        setRole(newRole);
        localStorage.setItem("token", newToken);
        localStorage.setItem("role", newRole);
    };

    const logout = () => {
        setToken(null);
        setRole(null);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ token, role, isAuthenticated, login, logout }}>
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
