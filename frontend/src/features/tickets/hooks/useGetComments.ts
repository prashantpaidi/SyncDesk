import { useQuery } from '@tanstack/react-query';

export interface CommentResponse {
    id: number;
    content: string;
    authorName: string;
    createdAt: string;
    isVisibleToUser: boolean;
}

const getCommentsApi = async (ticketId: string): Promise<CommentResponse[]> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/tickets/${ticketId}/comments`, {
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
        throw new Error('Failed to fetch comments');
    }

    return response.json();
};

export const useGetComments = (ticketId: string) => {
    return useQuery({
        queryKey: ['ticket', ticketId, 'comments'],
        queryFn: () => getCommentsApi(ticketId),
        enabled: !!ticketId,
    });
};
