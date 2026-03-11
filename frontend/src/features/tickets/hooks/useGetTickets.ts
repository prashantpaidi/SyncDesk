import { useQuery } from '@tanstack/react-query';

export type TicketResponse = {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
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
