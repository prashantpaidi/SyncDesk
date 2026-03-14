import { useMutation } from '@tanstack/react-query';

export type CreateTicketRequest = {
    title: string;
    description: string;
    priority?: string;
};

const createTicketApi = async (data: CreateTicketRequest) => {
    const token = localStorage.getItem('token');

    // Default priority to MEDIUM if not provided
    const payload = {
        title: data.title,
        description: data.description,
        priority: data.priority || "MEDIUM"
    };

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/tickets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
    });

    if (response.status === 401) {
        window.dispatchEvent(new Event('unauthorized'));
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        let errorMessage = 'Failed to create incident';
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

export const useCreateTicket = () => {
    return useMutation({
        mutationFn: createTicketApi,
    });
};
