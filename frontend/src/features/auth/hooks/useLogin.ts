import { useMutation } from '@tanstack/react-query';

export type LoginCredentials = {
    email: string;
    password: string;
};

const loginApi = async (credentials: LoginCredentials) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            // fallback
        }
        throw new Error(errorMessage);
    }

    // Attempt to parse JSON response. The backend might return HTML or Empty on success if it set a cookie, but we expect JSON
    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

export const useLogin = () => {
    return useMutation({
        mutationFn: loginApi,
    });
};
