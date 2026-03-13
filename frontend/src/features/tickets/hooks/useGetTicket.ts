import { useQuery } from '@tanstack/react-query';
import type { TicketResponse } from './useGetTickets';

const getTicketApi = async (id: string): Promise<TicketResponse> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/tickets/${id}`, {
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
        throw new Error('Failed to fetch incident');
    }

    return response.json();
};

export const useGetTicket = (id: string) => {
    return useQuery({
        queryKey: ['ticket', id],
        queryFn: () => getTicketApi(id),
        enabled: !!id,
    });
};
