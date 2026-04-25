import { useState } from 'react';
import { format } from 'date-fns';
import { useGetComments } from '../hooks/useGetComments';
import { useAddComment } from '../hooks/useAddComment';
import { Loader2, Send, Lock } from 'lucide-react';

interface CommentSectionProps {
    ticketId: string;
    role: string;
}

export function CommentSection({ ticketId, role }: CommentSectionProps) {
    const { data: comments, isLoading, isError } = useGetComments(ticketId);
    const { mutate: addComment, isPending: isSubmitting } = useAddComment();
    
    const [content, setContent] = useState('');
    const [isVisibleToUser, setIsVisibleToUser] = useState(true);

    const isAgentOrManager = role === 'AGENT' || role === 'MANAGER';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        addComment({
            ticketId,
            content: content.trim(),
            isVisibleToUser: isAgentOrManager ? isVisibleToUser : true
        }, {
            onSuccess: () => {
                setContent('');
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-8 text-red-500 bg-red-50 rounded-card border border-red-100">
                Failed to load comments.
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-text-main mb-6 font-sans flex items-center gap-2">
                Activity & Comments
                <span className="bg-surface-input text-text-muted text-sm px-2 py-0.5 rounded-full font-mono font-normal">
                    {comments?.length || 0}
                </span>
            </h3>

            <div className="space-y-6 mb-8">
                {comments && comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className={`flex flex-col gap-2 p-5 rounded-card border transition-all ${
                            !comment.isVisibleToUser 
                                ? 'bg-warning-bg border-warning-border shadow-sm' 
                                : 'bg-surface-card border-border'
                        }`}>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-text-main text-sm">
                                        {comment.authorName}
                                    </span>
                                    <span className="text-text-subtle text-xs font-mono">
                                        {format(new Date(comment.createdAt), 'MMM dd, HH:mm')}
                                    </span>
                                </div>
                                {!comment.isVisibleToUser && (
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-warning-bg text-warning text-[10px] font-bold uppercase tracking-wider border border-warning-border">
                                        <Lock className="w-3 h-3" />
                                        Internal Note
                                    </span>
                                )}
                            </div>
                            <div className="text-text-main text-sm leading-relaxed whitespace-pre-wrap">
                                {comment.content}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-surface-card rounded-card text-text-muted border border-dashed border-border">
                        No comments yet. Start the conversation!
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="bg-surface-card border border-border rounded-card p-4 shadow-sm">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full bg-transparent border-none focus:ring-0 text-text-main placeholder-text-muted text-sm min-h-[100px] resize-none pb-4"
                    disabled={isSubmitting}
                />
                
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                        {isAgentOrManager && (
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isVisibleToUser}
                                        onChange={(e) => setIsVisibleToUser(e.target.checked)}
                                        className="peer appearance-none w-5 h-5 border-2 border-border rounded-[4px] checked:bg-brand-accent checked:border-brand-accent transition-all cursor-pointer"
                                    />
                                    <svg
                                        className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-text-main group-hover:text-brand-accent transition-colors">
                                    Visible to Customer
                                </span>
                            </label>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={!content.trim() || isSubmitting}
                        className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl text-sm font-bold shadow-button hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Send Message
                    </button>
                </div>
            </form>
        </div>
    );
}
