import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AssignTicketVariables {
    ticketId: string;
    userId: number;
}

const assignTicketApi = async ({ ticketId, userId }: AssignTicketVariables) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/tickets/${ticketId}/assign/${userId}`, {
        method: 'PATCH',
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
        throw new Error('Failed to assign ticket');
    }

    return response.json();
};

export const useAssignTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: assignTicketApi,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
};
