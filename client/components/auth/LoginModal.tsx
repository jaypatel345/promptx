"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/apiClient";
import { API_BASE } from "@/lib/apiBase";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);

  // Autofocus email input when modal opens
  useEffect(() => {
    if (open) {
      setError(null);
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/auth/login`, {
        email: email.trim(),
        password,
      });

      if (response.data?.success) {
        // Fetch user profile
        const meRes = await apiClient.get(`/user/me`);
        const isGuest = !!meRes.data?.data?.isGuest;
        const dataUser = meRes.data?.data?.user || response.data?.data?.user || null;
        const newIsLoggedIn = !!meRes.data?.success && !!dataUser && !isGuest;

        // Persist to local storage for instant sync across tabs & components
        localStorage.setItem(
          "authState",
          JSON.stringify({ isLoggedIn: newIsLoggedIn })
        );
        localStorage.setItem(
          "userProfile",
          JSON.stringify(!isGuest ? dataUser : null)
        );

        // Notify app-wide auth listeners
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("authChange"));
        }

        onSuccess?.(dataUser);
        onClose();
      } else {
        setError(response.data?.message || response.data?.error || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Invalid email or password. Please try again.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 sm:p-7 shadow-2xl z-10 text-neutral-900 dark:text-neutral-100"
          >
            {/* Header: Brand Icon & Title + Close */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
                  X
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-neutral-950 dark:text-white">
                    Sign in to PromptX
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Welcome back. Access your prompts.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Google Social OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-10 rounded-xl font-medium text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider text-neutral-400 dark:text-neutral-500">
                <span className="bg-white dark:bg-neutral-950 px-2.5">or with email</span>
              </div>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3.5 p-2.5 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start gap-2"
              >
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    placeholder="name@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    disabled={loading}
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:bg-white dark:focus:bg-neutral-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Password
                  </label>
                  <Link
                    href="/forget-password"
                    onClick={onClose}
                    className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    disabled={loading}
                    className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:bg-white dark:focus:bg-neutral-900 transition-all"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-1 rounded-xl font-medium text-xs bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>

            {/* Footer switcher */}
            <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-900 text-center text-xs text-neutral-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/Signup"
                onClick={onClose}
                className="font-medium text-neutral-900 dark:text-white hover:underline transition-colors"
              >
                Create account
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
