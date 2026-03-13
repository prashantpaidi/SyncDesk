import { useQuery } from '@tanstack/react-query';

export type UserResponse = {
    id: number;
    name: string;
    email: string;
    role: string;
};

const getUsersApi = async (): Promise<UserResponse[]> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/users`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
    });

    if (response.status === 401) {
        window.dispatchEvent(new Event('unauthorized'));
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }

    return response.json();
};

export const useGetUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: getUsersApi,
    });
};
