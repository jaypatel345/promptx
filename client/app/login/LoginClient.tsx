"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { apiClient } from "@/lib/apiClient";
import { API_BASE } from "@/lib/apiBase";

interface LoginClientProps {
  initialMode?: "login" | "signup";
}

export default function LoginClient({ initialMode = "login" }: LoginClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode state: "login" or "signup"
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Detect mode from search params on mount or param change
  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "signup") {
      setMode("signup");
    } else if (modeParam === "login") {
      setMode("login");
    }
  }, [searchParams]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "missing_code") {
      setError("Google authentication was cancelled or expired. Please try again.");
    } else if (errorParam) {
      setError(`Authentication error: ${errorParam}`);
    }
  }, [searchParams]);

  // Password strength calculation for signup
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "bg-red-500" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-amber-500" };
      case 3:
        return { score: 3, label: "Good", color: "bg-blue-500" };
      case 4:
      default:
        return { score: 4, label: "Strong", color: "bg-emerald-500" };
    }
  }, [password]);

  const handleGoogleAuth = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await apiClient.post(`/auth/login`, {
        email: email.trim(),
        password,
      });

      if (response.data?.success) {
        const meRes = await apiClient.get(`/user/me`);
        const isGuest = !!meRes.data?.data?.isGuest;
        const dataUser = meRes.data?.data?.user || response.data?.data?.user || null;
        const newIsLoggedIn = !!meRes.data?.success && !!dataUser && !isGuest;

        localStorage.setItem(
          "authState",
          JSON.stringify({ isLoggedIn: newIsLoggedIn })
        );
        localStorage.setItem(
          "userProfile",
          JSON.stringify(!isGuest ? dataUser : null)
        );

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("authChange"));
        }

        router.replace("/enhancer");
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

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!username.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const signupRes = await axios.post(
        `${API_BASE}/auth/signup`,
        {
          username: username.trim(),
          email: email.trim(),
          password,
        },
        { withCredentials: true }
      );

      if (signupRes.data?.success) {
        // Automatic login right after registration for a frictionless experience
        try {
          const loginRes = await apiClient.post(`/auth/login`, {
            email: email.trim(),
            password,
          });

          if (loginRes.data?.success) {
            const meRes = await apiClient.get(`/user/me`);
            const isGuest = !!meRes.data?.data?.isGuest;
            const dataUser = meRes.data?.data?.user || loginRes.data?.data?.user || null;
            const newIsLoggedIn = !!meRes.data?.success && !!dataUser && !isGuest;

            localStorage.setItem(
              "authState",
              JSON.stringify({ isLoggedIn: newIsLoggedIn })
            );
            localStorage.setItem(
              "userProfile",
              JSON.stringify(!isGuest ? dataUser : null)
            );

            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("authChange"));
            }

            router.replace("/enhancer");
            return;
          }
        } catch {
          // If auto-login fails, switch tab to login with a friendly message
          setMode("login");
          setSuccessMessage("Account created successfully! Please sign in with your password.");
          return;
        }

        setMode("login");
        setSuccessMessage("Account created successfully! Please sign in.");
      } else {
        setError(signupRes.data?.message || signupRes.data?.error || "Registration failed.");
      }
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed. Please check your details and try again.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Left Column: Focused Auth Card */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-6 sm:px-12 md:px-16 py-8 min-h-screen">
        {/* Brand Header */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto lg:mx-0">
          <Link href="/" aria-label="PromptX Home" className="flex items-center gap-2 group">
            <Image
              src="/Rectangle.png"
              alt="PromptX Logo"
              width={100}
              height={100}
              priority
              className="w-36 h-7 object-contain dark:hidden"
            />
            <Image
              src="/AdobeStock_450013573_Preview 1.png"
              alt="PromptX Logo"
              width={100}
              height={100}
              priority
              className="w-36 h-7 object-contain hidden dark:block"
            />
          </Link>
          <Link
            href="/"
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
        </div>

        {/* Center Auth Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 py-6 sm:py-8">
          {/* Segmented Mode Switcher (Log In / Sign Up) */}
          <div className="flex p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl mb-6 border border-neutral-200/80 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              {mode === "login"
                ? "Sign in to your PromptX account to access your saved prompts."
                : "Join PromptX to generate and optimize production-grade prompts."}
            </p>
          </div>

          {/* Google OAuth One-Click */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full h-11 rounded-xl font-medium text-xs sm:text-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700"
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
            <span>
              {mode === "login" ? "Continue with Google" : "Sign up with Google"}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider text-neutral-400 dark:text-neutral-500">
              <span className="bg-white dark:bg-black px-3">or continue with email</span>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5"
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start gap-2.5"
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Email address
                  </label>
                  <input
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
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:bg-white dark:focus:bg-neutral-900 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Password
                    </label>
                    <Link
                      href="/forget-password"
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
                      className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:bg-white dark:focus:bg-neutral-900 transition-all"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
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
                  className="w-full h-11 rounded-xl font-medium text-xs sm:text-sm bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleSignupSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="alex_dev"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError(null);
                    }}
                    disabled={loading}
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:bg-white dark:focus:bg-neutral-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Email address
                  </label>
                  <input
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
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:bg-white dark:focus:bg-neutral-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={loading}
                      className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:bg-white dark:focus:bg-neutral-900 transition-all"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
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

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              step <= passwordStrength.score
                                ? passwordStrength.color
                                : "bg-neutral-200 dark:bg-neutral-800"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-neutral-400">
                        <span>Strength</span>
                        <span className="font-medium text-neutral-600 dark:text-neutral-300">
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms Consent */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="terms-checkbox" className="text-[11px] text-neutral-500 leading-tight">
                    I agree to the{" "}
                    <Link href="/terms" className="underline hover:text-neutral-900 dark:hover:text-white">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline hover:text-neutral-900 dark:hover:text-white">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl font-medium text-xs sm:text-sm bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                      </svg>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Switch Prompt */}
          <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-900 text-center text-xs text-neutral-500">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-medium text-neutral-900 dark:text-white hover:underline cursor-pointer transition-colors"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-medium text-neutral-900 dark:text-white hover:underline cursor-pointer transition-colors"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer micro-links */}
        <div className="w-full max-w-md mx-auto lg:mx-0 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-600">
          <span>PromptX © 2026</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/pricing" className="hover:underline">Pricing</Link>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 text-white p-12 flex-col justify-between relative overflow-hidden border-l border-neutral-800">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: `24px 24px`,
          }}
        />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-[11px] font-mono text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            PromptX Cloud Engine
          </div>
          <div className="flex gap-1.5 text-neutral-400 text-xs font-mono">
            <span>ChatGPT</span>
            <span>•</span>
            <span>Claude</span>
            <span>•</span>
            <span>Midjourney</span>
          </div>
        </div>

        {/* Center Prompt Visual Card */}
        <div className="relative z-10 my-auto py-8">
          <div className="max-w-lg mx-auto space-y-4">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  <span className="text-[11px] font-mono text-neutral-400 ml-2">session-active.ts</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/50">
                  Synced Across Devices
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-200">
                  <span className="text-neutral-500 font-bold block mb-1">PROMPTX SAVED WORKSPACE</span>
                  <p className="text-neutral-300 leading-relaxed">
                    Instant access to your custom personas, generated prompt history, and multi-model variables.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-neutral-300">
                    <span className="text-neutral-400 font-mono text-[10px] block">TEMPLATES</span>
                    36 Tested Prompts
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-neutral-300">
                    <span className="text-neutral-400 font-mono text-[10px] block">SECURITY</span>
                    Zero Model Training
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-800 pt-6">
          <span>Enterprise-grade prompt structuring</span>
          <span>Fast, reliable, private</span>
        </div>
      </div>
    </div>
  );
}
