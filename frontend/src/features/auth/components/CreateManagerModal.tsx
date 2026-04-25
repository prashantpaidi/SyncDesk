import React, { useState } from 'react';
import { X, UserPlus, User, Mail, Lock } from 'lucide-react';
import { useRegister } from '../hooks/useRegister';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateManagerModal({ isOpen, onClose }: Props) {
    const { mutate: register, isPending } = useRegister();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'MANAGER'
    });

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccessMessage('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        register(
            formData,
            {
                onSuccess: () => {
                    setSuccessMessage(`${formData.role === 'MANAGER' ? 'Manager' : 'Agent'} account created successfully!`);
                    setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'MANAGER' });
                    setTimeout(() => {
                        onClose();
                        setSuccessMessage('');
                    }, 2000);
                },
                onError: (err: any) => {
                    setError(err.message || 'Failed to create manager account');
                }
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-surface-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden my-auto max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface-card/50 shrink-0">
                    <div className="flex items-center gap-2 text-text-main">
                        <UserPlus className="w-5 h-5 text-brand" />
                        <h2 className="text-lg font-bold font-sans">Add Member</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-error-bg border border-error-border text-error rounded-card text-sm font-medium">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-4 p-3 bg-success-bg border border-success-border text-success rounded-card text-sm font-medium">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-text-main ml-1">Role</label>
                            <div className="flex gap-4 p-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-text-main cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="MANAGER"
                                        checked={formData.role === 'MANAGER'}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-brand accent-brand bg-surface-input border-border focus:ring-brand focus:ring-offset-surface-card"
                                    />
                                    Manager
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-text-main cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="AGENT"
                                        checked={formData.role === 'AGENT'}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-brand accent-brand bg-surface-input border-border focus:ring-brand focus:ring-offset-surface-card"
                                    />
                                    Agent
                                </label>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-text-main ml-1">Full Name</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle">
                                    <User className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-pill py-3 pl-10 pr-4 text-sm font-medium text-text-main outline-none placeholder:text-text-subtle transition-all duration-200 bg-surface-input border border-transparent focus:bg-surface-card focus:border-border-focus focus:shadow-input"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-text-main ml-1">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="manager@syncdesk.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-pill py-3 pl-10 pr-4 text-sm font-medium text-text-main outline-none placeholder:text-text-subtle transition-all duration-200 bg-surface-input border border-transparent focus:bg-surface-card focus:border-border-focus focus:shadow-input"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-text-main ml-1">Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-pill py-3 pl-10 pr-4 text-sm font-medium text-text-main outline-none placeholder:text-text-subtle transition-all duration-200 bg-surface-input border border-transparent focus:bg-surface-card focus:border-border-focus focus:shadow-input font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-text-main ml-1">Confirm Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-pill py-3 pl-10 pr-4 text-sm font-medium text-text-main outline-none placeholder:text-text-subtle transition-all duration-200 bg-surface-input border border-transparent focus:bg-surface-card focus:border-border-focus focus:shadow-input font-mono"
                                />
                            </div>
                        </div>

                        <div className="pt-4 pb-2 flex justify-end gap-3 mt-6 shrink-0 bg-surface-card">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-main bg-surface-input hover:bg-surface-muted rounded-pill transition-colors border border-border"
                                disabled={isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-5 py-2 text-sm font-bold text-white bg-brand hover:bg-brand-hover rounded-pill shadow-button hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                            >
                                {isPending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
