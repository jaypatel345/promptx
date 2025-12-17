"use client";
import { useTheme } from "@/context/theme-context";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import signupImg from "@/public/signuppage.jpg"

function Signup() {
  const [isScrolled, setIsScrolled] = useState(true);
  const { theme, setTheme } = useTheme();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user.username || !user.email || !user.password) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await axios.post("/api/signup", {
        username: user.username.trim(),
        email: user.email.trim(),
        password: user.password,
      });

      if (response.data?.success) {
        router.back();
      }
    } catch (error: any) {
      console.error("Signup error:", error.response?.data);
      setError(error.response?.data?.error || "Signup failed");
    }
  };

  return (
    <>
      {/* Mobile: Single column | Desktop: 2 columns */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 min-h-screen">
        <div className="relative">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Home"
            className="absolute left-0 top-0 transition-all duration-500 ease-in-out z-50"
          >
            <Image
              src={
                theme === "light"
                  ? "/Rectangle.png"
                  : "/AdobeStock_450013573_Preview 1.png"
              }
              width={50}
              height={20}
              alt="promptx logo"
              className="ml-3 sm:ml-10 mt-3 w-10 h-8 "
            />
          </Link>

          {/* Main Content - Centered on Mobile */}
          <div className="flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 md:px-0 py-16 md:py-0">
            {/* Title */}
            <div className="text-2xl sm:text-3xl font-medium text-center mb-8 md:mb-10">
              Create your account
            </div>

            {/* Signup Options */}
            <div className="flex flex-col gap-4 md:gap-5 items-center transition-all duration-500 w-full max-w-[340px] sm:max-w-[380px] md:max-w-sm ">
              {/* Google Sign Up */}
              <Link href="/" className="w-full">
                <button className="border w-full rounded-full py-2.5 md:py-2 hover:bg-gray-200/20 cursor-pointer flex items-center justify-center relative text-sm sm:text-base">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="absolute left-3 sm:left-4 bg-white rounded-full text-black dark:bg-black"
                    width={20}
                    height={20}
                  >
                    <g>
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </g>
                  </svg>
                  Sign up with Google
                </button>
              </Link>

              {/* Divider */}
              <div className="relative w-full h-px bg-linear-to-r from-transparent via-gray-300 to-transparent"></div>

              {/* Email Sign Up */}
              <Link href="/" className="w-full">
                <button className="border w-full rounded-full py-2.5 md:py-2 hover:bg-gray-200/20 cursor-pointer flex items-center justify-center relative text-sm sm:text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width={20}
                    height={20}
                    className="absolute left-3 sm:left-4"
                    fill="currentColor"
                  >
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  Sign up with email
                </button>
              </Link>

              {/* Apple Sign Up */}
              <Link href="/" className="w-full">
                <button className="border w-full rounded-full py-2.5 md:py-2 hover:bg-gray-200/20 cursor-pointer flex items-center justify-center relative text-sm sm:text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width={20}
                    height={20}
                    className="absolute left-3 sm:left-4"
                    fill="currentColor"
                  >
                    <path d="M16.365 1.43c0 1.14-.42 2.07-1.26 2.86-.84.78-1.86 1.25-2.97 1.17-.12-1.11.39-2.22 1.2-3.01.84-.78 2.07-1.28 3.03-1.32.03.1.06.2.06.3zm4.02 14.3c-.03-.03-3.09-1.5-3.09-4.53 0-2.82 2.19-4.11 2.28-4.17-1.26-1.8-3.24-2.04-3.93-2.07-1.68-.18-3.27 1-4.12 1-.87 0-2.16-.96-3.56-.96-1.83.03-3.54 1.08-4.47 2.76-1.92 3.33-.49 8.25 1.38 10.95.93 1.32 2.01 2.82 3.45 2.76 1.41-.06 1.95-.9 3.66-.9 1.68 0 2.19.9 3.69.87 1.53-.03 2.49-1.35 3.42-2.67.69-.99.96-1.53 1.5-2.67z" />
                  </svg>
                  Sign up with Apple
                </button>
              </Link>

              {/* PromptX Sign Up */}
              <button
                className="border w-full rounded-full py-2.5 md:py-2 hover:bg-gray-200/20 cursor-pointer flex items-center justify-center relative text-sm sm:text-base"
                onClick={() => {
                  setIsSignupOpen(true);
                }}
              >
                <Image
                  src={
                    theme === "light"
                      ? "/Rectangle.png"
                      : "/AdobeStock_450013573_Preview 1.png"
                  }
                  width={22}
                  height={20}
                  alt="promptx logo"
                  className="absolute left-3 sm:left-4"
                />
                Sign up with PromptX
              </button>

              {/* Sign In Link */}
              <Link href="/" className="w-full">
                <div className="flex justify-center text-gray-700/70 text-sm sm:text-base mt-2">
                  Already have an account?
                  <span className="hover:text-gray-800/80 text-black ml-1">
                    Sign in
                  </span>
                </div>
              </Link>
            </div>

            {/* Signup Modal */}
            {isSignupOpen && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                onClick={() => setIsSignupOpen(false)}
              >
                {/* Modal Content */}
                <div
                  className="dark:bg-neutral-900 bg-white w-full max-w-[340px] sm:max-w-md md:max-w-sm p-6 sm:p-7 md:p-8 border rounded-2xl md:rounded-3xl border-gray-200 dark:border-gray-100 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => setIsSignupOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Close"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={onSignup}>
                    {/* Username */}
                    <input
                      type="text"
                      value={user.username}
                      placeholder="Username"
                      onChange={(e) => {
                        setUser({ ...user, username: e.target.value });
                      }}
                      className="border-b border-gray-300 dark:border-neutral-700 w-full px-1 py-2 sm:py-2 mb-4 text-sm sm:text-[15px] bg-transparent text-black dark:text-white outline-none transition-all focus:border-gray-500 dark:focus:border-neutral-500"
                    />

                    {/* Email */}
                    <input
                      type="email"
                      value={user.email}
                      placeholder="Email"
                      onChange={(e) => {
                        setUser({ ...user, email: e.target.value });
                      }}
                      className="border-b border-gray-300 dark:border-neutral-700 w-full px-1 py-2 sm:py-2 mb-4 text-sm sm:text-[15px] bg-transparent text-black dark:text-white outline-none transition-all focus:border-gray-500 dark:focus:border-neutral-500"
                    />

                    {/* Password */}
                    <div className="flex items-center relative mb-4">
                      <input
                        type="password"
                        value={user.password}
                        placeholder="Password"
                        onChange={(e) => {
                          setUser({ ...user, password: e.target.value });
                        }}
                        className="border-b border-gray-300 dark:border-neutral-700 w-full px-1 py-2 sm:py-2 text-sm mb-3 sm:text-[15px] bg-transparent text-black dark:text-white outline-none transition-all focus:border-gray-500 dark:focus:border-neutral-500"
                      />
                      <svg
                        width="16"
                        height="16"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="cursor-pointer absolute right-0 bottom-3 sm:w-[18px] sm:h-[18px] mb-2"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8 2.5C3 2.5 0 8 0 8C0 8 3 13.5 8 13.5C13 13.5 16 8 16 8C16 8 13 2.5 8 2.5ZM10.4749 10.4749C9.8185 11.1313 8.92826 11.5 8 11.5C7.07174 11.5 6.1815 11.1313 5.52513 10.4749C4.86875 9.8185 4.5 8.92826 4.5 8C4.5 7.07174 4.86875 6.1815 5.52513 5.52513C6.1815 4.86875 7.07174 4.5 8 4.5C8.92826 4.5 9.8185 4.86875 10.4749 5.52513C11.1313 6.1815 11.5 7.07174 11.5 8C11.5 8.92826 11.1313 9.8185 10.4749 10.4749ZM9.76777 9.76777C10.2366 9.29893 10.5 8.66304 10.5 8C10.5 7.33696 10.2366 6.70107 9.76777 6.23223C9.29893 5.76339 8.66304 5.5 8 5.5C7.33696 5.5 6.70107 5.76339 6.23223 6.23223C5.76339 6.70107 5.5 7.33696 5.5 8C5.5 8.66304 5.76339 9.29893 6.23223 9.76777C6.70107 10.2366 7.33696 10.5 8 10.5C8.66304 10.5 9.29893 10.2366 9.76777 9.76777Z"
                        ></path>
                      </svg>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <p className="text-red-500 text-xs sm:text-sm mb-4">
                        {error}
                      </p>
                    )}

                    {/* Submit Button */}
                    <button
                      className="w-full py-3 rounded-full bg-black text-white/80 font-medium transition-all text-sm sm:text-[15px] mt-2 hover:bg-neutral-800/95 cursor-pointer"
                      type="submit"
                    >
                      SIGN UP
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Side Image - Hidden on Mobile */}
        <div className="relative w-full h-screen overflow-hidden rounded-lg">
          <Image
            src={signupImg}
            alt="Signup Illustration"
            fill
            priority
            placeholder="blur"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            quality={70}
          />
        </div>
      </div>
    </>
  );
}

export default Signup;
