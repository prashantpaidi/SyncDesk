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

/**
 * Provides authentication context (token, `isAuthenticated`, `login`, and `logout`) to its child subtree.
 *
 * @param children - React nodes rendered inside the provider
 * @returns A React element that wraps `children` with the AuthContext provider
 */
export function AuthProvider({ children }: { children: ReactNode }) {
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

    const isAuthenticated = !!token && !!role;

    return (
        <AuthContext.Provider value={{ token, role, isAuthenticated, login, logout }}>
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
