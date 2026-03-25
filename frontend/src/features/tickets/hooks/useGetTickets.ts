import { useQuery } from '@tanstack/react-query';

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

const getTicketsApi = async (): Promise<TicketResponse[]> => {
    const token = localStorage.getItem('token');

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
    return useQuery({
        queryKey: ['tickets'],
        queryFn: getTicketsApi,
    });
};
