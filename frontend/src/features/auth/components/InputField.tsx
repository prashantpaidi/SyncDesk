import React from "react";
import type { UseFormRegisterReturn, FieldError } from "react-hook-form";

type InputFieldProps = {
    id: string;
    label: string;
    type?: string;
    icon: React.ReactNode;
    registration: UseFormRegisterReturn;
    error?: FieldError;
    placeholder?: string;
    isFocused: boolean;
    onFocus: () => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    rightElement?: React.ReactNode;
    labelRightElement?: React.ReactNode;
};

export function InputField({
    id,
    label,
    type = "text",
    icon,
    registration,
    error,
    placeholder,
    isFocused,
    onFocus,
    onBlur,
    rightElement,
    labelRightElement,
}: InputFieldProps) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
                <label htmlFor={id} className="text-[13px] font-semibold text-text-main">
                    {label}
                </label>
                {labelRightElement}
            </div>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {React.cloneElement(icon as React.ReactElement<any>, {
                        className: `w-4 h-4 transition-colors duration-200 ${isFocused ? "text-brand-accent" : "text-text-subtle"}`
                    })}
                </span>
                <input
                    type={type}
                    id={id}
                    {...registration}
                    onFocus={onFocus}
                    onBlur={(e) => {
                        registration.onBlur(e);
                        onBlur(e);
                    }}
                    placeholder={placeholder}
                    className={`
            w-full rounded-pill py-3 pl-10 ${rightElement ? "pr-12" : "pr-4"}
            text-sm font-medium text-text-main outline-none
            placeholder:text-text-subtle transition-all duration-200
            ${type === "password" || type === "text" && rightElement ? (type === "text" ? "font-sans" : "font-mono") : ""}
            ${isFocused
                            ? "bg-surface-card border border-border-focus shadow-input"
                            : "bg-surface-input border border-transparent"
                        }
          `}
                />
                {rightElement && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-xs text-red-500 ml-1">{error.message}</p>
            )}
        </div>
    );
}
