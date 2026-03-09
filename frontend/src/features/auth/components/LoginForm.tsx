import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin, type LoginCredentials } from "../hooks/useLogin";
import { Zap, Mail, Lock, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { InputField } from "./InputField";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"), // Just check it's not empty for login
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });
    const loginMutation = useLogin();
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = (data: LoginFormValues) => {
        loginMutation.mutate(data as LoginCredentials, {
            onSuccess: (responseData) => {
                if (responseData.token) {
                    login(responseData.token);
                    navigate("/dashboard");
                } else {
                    console.error("No token received from backend");
                }
            }
        });
    };

    const loading = loginMutation.isPending;

    return (
        <>
            {/* ── Logo & Header ── */}
            <div className="text-center mb-10">
                <div className="w-12 h-12 bg-brand-dark rounded-card flex items-center justify-center mx-auto mb-6 shadow-logo relative overflow-hidden">
                    <Zap className="w-5 h-5 text-white" strokeWidth={2.5} fill="currentColor" />
                    <div
                        className="absolute inset-0 rounded-card pointer-events-none"
                        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)" }}
                    />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-text-main">
                    Welcome back
                </h1>
                <p className="text-sm text-text-muted mt-1.5">
                    Enter your details to sign in.
                </p>
                {loginMutation.isError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-sm font-medium text-red-500">{loginMutation.error.message}</p>
                    </div>
                )}
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="name@company.com"
                    icon={<Mail />}
                    registration={register("email")}
                    error={errors.email}
                    isFocused={focusedField === "email"}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                />

                {/* Password */}
                <InputField
                    id="password"
                    label="Password"
                    // labelRightElement=
                    // {
                    //     <a href="#" className="text-[11px] font-semibold text-brand-accent hover:opacity-80 transition-opacity">
                    //         Forgot?
                    //     </a>
                    // }
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    icon={<Lock />}
                    registration={register("password")}
                    error={errors.password}
                    isFocused={focusedField === "password"}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    rightElement={
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="text-text-subtle hover:text-text-muted transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    }
                />

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`
            w-full rounded-pill py-3.5
            text-sm font-bold text-white
            transition-all duration-200
            active:translate-y-0 active:shadow-none
            ${loading
                            ? "bg-text-muted cursor-not-allowed"
                            : "bg-brand-dark shadow-button hover:opacity-90 hover:-translate-y-0.5"
                        }
          `}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                            Signing in…
                        </span>
                    ) : (
                        "Sign In"
                    )}
                </button>

                {/* Divider + Social */}
                <div className="pt-3">
                    <div className="relative flex items-center mb-5">
                        <div className="flex-grow border-t border-border" />
                        <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-text-subtle uppercase tracking-widest">
                            Or continue with
                        </span>
                        <div className="flex-grow border-t border-border" />
                    </div>
                    {/* 
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: <FaGithub className="w-4 h-4" />, label: "GitHub" },
                            { icon: <FcGoogle className="w-4 h-4" />, label: "Google" },
                        ].map(({ icon, label }) => (
                            <button
                                key={label}
                                type="button"
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill border border-border text-[12px] font-semibold text-text-main hover:bg-surface-input active:scale-95 transition-all duration-150"
                            >
                                {icon}
                                {label}
                            </button>
                        ))}
                    </div> */}

                    <p className="text-center text-[12px] text-text-muted mt-7">
                        No account?
                        <Link to="/sign-up" className="font-bold text-text-main hover:underline underline-offset-2">
                            Sign up
                        </Link>
                    </p>
                </div>

            </form>
        </>
    );
}
