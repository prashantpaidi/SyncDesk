import { createContext, useContext } from "react";

export interface AuthContextType {
    token: string | null;
    role: string | null;
    userId: number | null;
    userName: string | null;
    isAuthenticated: boolean;
    login: (token: string, role: string, userId: number, userName: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
