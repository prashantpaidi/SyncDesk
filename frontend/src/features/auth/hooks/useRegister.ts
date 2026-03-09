import { useMutation } from '@tanstack/react-query';

export type RegisterCredentials = {
    name: string;
    email: string;
    password: string;
    role?: string;
    confirmPassword?: string;
};

const registerApi = async (credentials: RegisterCredentials) => {
    if (credentials.confirmPassword !== undefined &&
        credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
    }

    // Default role to "CUSTOMER" if not provided
    const payload = {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        role: credentials.role || "CUSTOMER"
    };

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            // fallback
        }
        throw new Error(errorMessage);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

export const useRegister = () => {
    return useMutation({
        mutationFn: registerApi,
    });
};
