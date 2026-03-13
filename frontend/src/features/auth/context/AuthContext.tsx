import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

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

/**
 * Provides authentication context (token, `isAuthenticated`, `login`, and `logout`) to its child subtree.
 *
 * @param children - React nodes rendered inside the provider
 * @returns A React element that wraps `children` with the AuthContext provider
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const [token, setToken] = useState<string | null>(() => {
        const storedToken = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");

        if (!storedToken || !storedRole) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            return null;
        }

        return storedToken;
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
        
        queryClient.clear();
    };

    const isAuthenticated = !!token && !!role;

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

/**
 * Accesses the authentication context for the current React component.
 *
 * @returns The authentication context object containing `token`, `isAuthenticated`, `login`, and `logout`.
 * @throws Error if the hook is used outside of an `AuthProvider`.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
