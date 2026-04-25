import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateTicket, type CreateTicketRequest } from "../hooks/useCreateTicket";
import { FileText, AlignLeft, AlertCircle, LoaderCircle, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { InputField } from "../../auth/components/InputField";
import { Link, useNavigate } from "react-router";

const createTicketSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title is too long"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

type CreateTicketFormValues = z.infer<typeof createTicketSchema>;

export function CreateTicketForm() {
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateTicketFormValues>({
        resolver: zodResolver(createTicketSchema),
        defaultValues: {
            priority: "MEDIUM"
        }
    });

    const createTicketMutation = useCreateTicket();

    const onSubmit = (data: CreateTicketFormValues) => {
        createTicketMutation.mutate(data as CreateTicketRequest, {
            onSuccess: () => {
                setIsSuccess(true);
                reset();
                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);
            }
        });
    };

    const loading = createTicketMutation.isPending;

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <h3 className="text-2xl font-bold text-text-main tracking-tight">Incident Created</h3>
                <p className="text-text-muted text-sm">Your incident has been successfully reported. Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <>
            {/* ── Logo & Header ── */}
            <div className="text-center mb-10">
                <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center mx-auto mb-6 shadow-logo relative overflow-hidden">
                    <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2.5} />
                    <div
                        className="absolute inset-0 rounded-card pointer-events-none"
                        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)" }}
                    />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-text-main">
                    Report an Incident
                </h1>
                <p className="text-sm text-text-muted mt-1.5">
                    Provide details about the issue you are experiencing.
                </p>
                {createTicketMutation.isError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-sm font-medium text-red-500">{createTicketMutation.error.message}</p>
                    </div>
                )}
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    id="title"
                    label="Incident Title"
                    placeholder="Brief summary of the issue"
                    icon={<FileText />}
                    registration={register("title")}
                    error={errors.title}
                    isFocused={focusedField === "title"}
                    onFocus={() => setFocusedField("title")}
                    onBlur={() => setFocusedField(null)}
                />

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                        <label htmlFor="description" className="text-[13px] font-semibold text-text-main">
                            Description
                        </label>
                    </div>
                    <div className="relative">
                        <span className="absolute left-4 top-3 pointer-events-none">
                            <AlignLeft className={`w-4 h-4 transition-colors duration-200 ${focusedField === 'description' ? "text-brand-accent" : "text-text-subtle"}`} />
                        </span>
                        <textarea
                            {...register("description")}
                            id="description"
                            rows={4}
                            onFocus={() => setFocusedField("description")}
                            onBlur={(e) => {
                                register("description").onBlur(e);
                                setFocusedField(null);
                            }}
                            placeholder="Detailed explanation of the incident..."
                            className={`
                                w-full rounded-xl py-3 pl-10 pr-4
                                text-sm font-medium text-text-main outline-none
                                placeholder:text-text-subtle transition-all duration-200 resize-none
                                ${focusedField === 'description'
                                    ? "bg-surface-card border border-border-focus shadow-input"
                                    : "bg-surface-input border border-transparent"
                                }
                            `}
                        />
                    </div>
                    {errors.description && (
                        <p className="text-xs text-red-500 ml-1">{errors.description.message as string}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                        <label htmlFor="priority" className="text-[13px] font-semibold text-text-main">
                            Priority Level
                        </label>
                    </div>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <AlertCircle className={`w-4 h-4 transition-colors duration-200 ${focusedField === 'priority' ? "text-brand-accent" : "text-text-subtle"}`} />
                        </span>
                        <select
                            {...register("priority")}
                            id="priority"
                            onFocus={() => setFocusedField("priority")}
                            onBlur={(e) => {
                                register("priority").onBlur(e);
                                setFocusedField(null);
                            }}
                            className={`
                                w-full rounded-xl py-3 pl-10 pr-4
                                text-sm font-medium text-text-main outline-none cursor-pointer appearance-none
                                placeholder:text-text-subtle transition-all duration-200
                                ${focusedField === 'priority'
                                    ? "bg-surface-card border border-border-focus shadow-input"
                                    : "bg-surface-input border border-transparent"
                                }
                            `}
                        >
                            <option value="LOW" className="bg-surface-main text-text-main">Low - Minor issue</option>
                            <option value="MEDIUM" className="bg-surface-main text-text-main">Medium - Normal severity</option>
                            <option value="HIGH" className="bg-surface-main text-text-main">High - Critical incident</option>
                        </select>
                    </div>
                    {errors.priority && (
                        <p className="text-xs text-red-500 ml-1">{errors.priority.message as string}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`
                        w-full rounded-xl py-3.5 mt-2
                        text-sm font-bold text-white
                        transition-all duration-200
                        active:translate-y-0 active:shadow-none active:scale-[0.98]
                        ${loading
                            ? "bg-text-muted cursor-not-allowed"
                            : "bg-brand shadow-button hover:opacity-90 hover:-translate-y-0.5"
                        }
                    `}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                            Submitting...
                        </span>
                    ) : (
                        "Submit Incident"
                    )}
                </button>

                {/* Divider + Social/Back */}
                <div className="pt-3">
                    <div className="relative flex items-center mb-5">
                        <div className="flex-grow border-t border-border" />
                        <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-text-subtle uppercase tracking-widest">
                            Cancel
                        </span>
                        <div className="flex-grow border-t border-border" />
                    </div>

                    <p className="text-center text-[12px] text-text-muted mt-7">
                        <Link to="/dashboard" className="font-bold text-text-main hover:underline underline-offset-2 flex items-center justify-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </Link>
                    </p>
                </div>
            </form>
        </>
    );
}
