import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AddCommentRequest {
    ticketId: string;
    content: string;
    isVisibleToUser: boolean;
}

const addCommentApi = async ({ ticketId, content, isVisibleToUser }: AddCommentRequest) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ content, isVisibleToUser }),
    });

    if (response.status === 401) {
        window.dispatchEvent(new Event('unauthorized'));
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add comment');
    }

    return response.json();
};

export const useAddComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addCommentApi,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId, 'comments'] });
        },
    });
};
