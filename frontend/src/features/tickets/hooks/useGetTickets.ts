import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/context/AuthContext';

export type TicketResponse = {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    createdById: number | null;
    createdByName: string | null;
    assignedToId: number | null;
    assignedToName: string | null;
};

const getTicketsApi = async (token: string): Promise<TicketResponse[]> => {

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/tickets`, {
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
        throw new Error('Failed to fetch incidents');
    }

    return response.json();
};

export const useGetTickets = () => {
    const { token } = useAuth();

    return useQuery({
        queryKey: ['tickets', token],
        queryFn: () => getTicketsApi(token!),
        enabled: !!token,
    });
};
