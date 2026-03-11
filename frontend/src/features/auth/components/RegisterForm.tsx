import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister, type RegisterCredentials } from "../hooks/useRegister";
import { Zap, Mail, Lock, User, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { InputField } from "./InputField";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "The passwords do not match",
    path: ["confirmPassword"], // path of error
});

// Since the schema output contains confirmPassword but the API might not need it
type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });
    const registerMutation = useRegister();
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = (data: RegisterFormValues) => {
        const { confirmPassword, ...apiData } = data;
        registerMutation.mutate(apiData as RegisterCredentials, {
            onSuccess: (responseData) => {
                if (responseData.token) {
                    login(responseData.token, responseData.role);
                    navigate("/dashboard");
                } else {
                    console.error("No token received from backend");
                }
            }
        });
    };

    const loading = registerMutation.isPending;

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
                    Create an account
                </h1>
                <p className="text-sm text-text-muted mt-1.5">
                    Enter your details to sign up.
                </p>
                {registerMutation.isError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-sm font-medium text-red-500">{registerMutation.error.message}</p>
                    </div>
                )}
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    id="name"
                    label="Full Name"
                    placeholder="John Doe"
                    icon={<User />}
                    registration={register("name")}
                    error={errors.name}
                    isFocused={focusedField === "name"}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                />

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

                {/* Confirm Password */}
                <InputField
                    id="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    icon={<Lock />}
                    registration={register("confirmPassword")}
                    error={errors.confirmPassword}
                    isFocused={focusedField === "confirmPassword"}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    rightElement={
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            className="text-text-subtle hover:text-text-muted transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                            Creating account…
                        </span>
                    ) : (
                        "Sign Up"
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

                    {/* <div className="grid grid-cols-2 gap-3">
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
                        Already have an account?{" "}
                        <Link to="/" className="font-bold text-text-main hover:underline underline-offset-2">
                            Sign in
                        </Link>
                    </p>
                </div>

            </form>
        </>
    );
}
