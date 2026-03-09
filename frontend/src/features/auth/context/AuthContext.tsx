import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
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
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("token");
    });

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem("token", newToken);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
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
