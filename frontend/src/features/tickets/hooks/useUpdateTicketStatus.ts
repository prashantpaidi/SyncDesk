import { useMutation, useQueryClient } from '@tanstack/react-query';

async function updateTicketStatus(ticketId: number, status: string) {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    
    const res = await fetch(`${baseUrl}/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status }),
    });

    if (res.status === 401) {
        window.dispatchEvent(new Event('unauthorized'));
        throw new Error('Session expired. Please log in again.');
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update status');
    }
    
    return res.json();
}

export function useUpdateTicketStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, status }: { ticketId: number; status: string }) =>
            updateTicketStatus(ticketId, status),
        onSuccess: (_, { ticketId }) => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', String(ticketId)] });
        },
    });
}
