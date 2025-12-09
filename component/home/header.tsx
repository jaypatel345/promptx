"use client";
import { useUi } from "@/context/UiContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/theme-context";
import { Router } from "next/router";
import axios from "axios";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(true);
  const { isNavOpen, setIsNavOpen } = useUi(); // default
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  function checkScrollPosition() {
    const fullScreen = window.innerHeight;
    const halfScreen = fullScreen * 0.5;

    const threshold = fullScreen + halfScreen; // 1.5 screen

    return window.scrollY >= threshold;
  }

  useEffect(() => {
    function handleScroll() {
      if (checkScrollPosition()) {
        setIsScrolled(false);
      } else {
        setIsScrolled(true);
      }
    }

    window.addEventListener("scroll", handleScroll);

    // Run once on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close navbar on reload ONLY for mobile screens
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) {
        // Tailwind sm breakpoint
        setIsNavOpen(false);
      }
    }
  }, []);

useEffect(() => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
      }
    }
  }
}, []);

  const onLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    setLoading(true);

    const response = await axios.post("http://localhost:3000/api/login", {
      email: user.email,
      password: user.password,
    });

    console.log("Login success:", response.data);

    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);
    }

    // Close login modal
    setIsLoginOpen(false);

    // redirect if needed
    // router.push("/");
  } catch (error: any) {
    console.log("Login failed:", error.response?.data || error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      {/* Header */}
      <header
        className="
    fixed top-0 z-50 w-full backdrop-blur-md text-black

    /* Mobile (default) */
    bg-white dark:bg-black

   xl:bg-linear-to-b xl:from-white/80 xl:to-white/40
xl:dark:bg-linear-to-b xl:dark:from-black/60 xl:dark:to-black/20
  "
      >
        <div className="flex justify-between items-center mx-3 sm:mx-4 md:mx-5 py-2.5 sm:py-3">
          {/* Left: Logo */}
          <div className="flex items-center text-2xl sm:text-4xl font-semibold">
            <div className="relative h-10 w-auto">
              {/* Large text logo */}
              <Link
                href="/"
                aria-label="Home"
                className={`absolute left-0 top-0 transition-all duration-500 ease-in-out 
      ${isScrolled ? "opacity-0 translate-y-0" : "opacity-0 -translate-y-2"}
    `}
              >
                <span className="cursor-pointer font-medium ml-2 md:ml-4 text-xl sm:text-2xl md:text-3xl">
                  <span className="bg-clip-text dark:text-white text-black">
                    prompt
                  </span>
                  <span className="relative">
                    <span className="bg-linear-to-r from-[#0070a0] via-[#68d1fe] to-[#f7f7f7] bg-clip-text text-transparent text-2xl sm:text-[28px] md:text-[32px]">
                      X
                    </span>
                  </span>
                </span>
              </Link>

              {/* Small image logo (light / dark) */}
              <Link
                href="/"
                aria-label="Home"
                className={`absolute left-0 top-0 transition-all duration-500 ease-in-out
      ${isScrolled ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"}
    `}
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
                  className="ml-4 sm:ml-10 mt-2 w-10 h-4 md:h-8 "
                />
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div
              className="absolute left-16  md:left-28 top-4 sm:top-5 cursor-pointer sm:relative sm:left-auto ml-8 sm:ml-14 md:top-0.5"
              onClick={() => setIsNavOpen(!isNavOpen)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className={
                  isNavOpen
                    ? "text-black dark:text-gray-400 sm:w-[18px] sm:h-[18px]"
                    : "text-gray-400 sm:w-[18px] sm:h-[18px]"
                }
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.35719 3H14.6428C15.7266 2.99999 16.6007 2.99998 17.3086 3.05782C18.0375 3.11737 18.6777 3.24318 19.27 3.54497C20.2108 4.02433 20.9757 4.78924 21.455 5.73005C21.7568 6.32234 21.8826 6.96253 21.9422 7.69138C22 8.39925 22 9.27339 22 10.3572V13.6428C22 14.7266 22 15.6008 21.9422 16.3086C21.8826 17.0375 21.7568 17.6777 21.455 18.27C20.9757 19.2108 20.2108 19.9757 19.27 20.455C18.6777 20.7568 18.0375 20.8826 17.3086 20.9422C16.6008 21 15.7266 21 14.6428 21H9.35717C8.27339 21 7.39925 21 6.69138 20.9422C5.96253 20.8826 5.32234 20.7568 4.73005 20.455C3.78924 19.9757 3.02433 19.2108 2.54497 18.27C2.24318 17.6777 2.11737 17.0375 2.05782 16.3086C1.99998 15.6007 1.99999 14.7266 2 13.6428V10.3572C1.99999 9.27341 1.99998 8.39926 2.05782 7.69138C2.11737 6.96253 2.24318 6.32234 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.32234 3.24318 5.96253 3.11737 6.69138 3.05782C7.39926 2.99998 8.27341 2.99999 9.35719 3ZM6.85424 5.05118C6.24907 5.10062 5.90138 5.19279 5.63803 5.32698C5.07354 5.6146 4.6146 6.07354 4.32698 6.63803C4.19279 6.90138 4.10062 7.24907 4.05118 7.85424C4.00078 8.47108 4 9.26339 4 10.4V13.6C4 14.7366 4.00078 15.5289 4.05118 16.1458C4.10062 16.7509 4.19279 17.0986 4.32698 17.362C4.6146 17.9265 5.07354 18.3854 5.63803 18.673C5.90138 18.8072 6.24907 18.8994 6.85424 18.9488C7.17922 18.9754 7.55292 18.9882 8 18.9943V5.0057C7.55292 5.01184 7.17922 5.02462 6.85424 5.05118ZM10 5V19H14.6C15.7366 19 16.5289 18.9992 17.1458 18.9488C17.7509 18.8994 18.0986 18.8072 18.362 18.673C18.9265 18.3854 19.3854 17.9265 19.673 17.362C19.8072 17.0986 19.8994 16.7509 19.9488 16.1458C19.9992 15.5289 20 14.7366 20 13.6V10.4C20 9.26339 19.9992 8.47108 19.9488 7.85424C19.8994 7.24907 19.8072 6.90138 19.673 6.63803C19.3854 6.07354 18.9265 5.6146 18.362 5.32698C18.0986 5.19279 17.7509 5.10062 17.1458 5.05118C16.5289 5.00078 15.7366 5 14.6 5H10Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </div>

          {/* Right: Search + Login */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <button
              aria-label="Search"
              className={`p-1 sm:p-2 rounded-full hover:bg-gray-100 transition dark:hover:bg-gray-700/40 ${
                pathname == "/Enhancer" ? "hidden" : ""
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-black dark:text-white sm:w-5 sm:h-5"
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsLoginOpen(false);
                }}
              >
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="16.65" y1="16.65" x2="21" y2="21"></line>
              </svg>
            </button>
            <button
              aria-label="Search"
              className={`p-1 sm:p-2 rounded-full hover:bg-gray-100 transition dark:text-gray-50  dark:hover:bg-gray-500/40 ${
                pathname == "/Enhancer" ? "" : "hidden"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="sm:w-5 sm:h-5"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSettingOpen((prev) => !prev);
                }}
              >
                <path
                  stroke="currentColor"
                  d="M13.5 3h-3C9.408 5.913 8.024 6.711 4.956 6.201l-1.5 2.598c1.976 2.402 1.976 4 0 6.402l1.5 2.598c3.068-.51 4.452.288 5.544 3.201h3c1.092-2.913 2.476-3.711 5.544-3.2l1.5-2.599c-1.976-2.402-1.976-4 0-6.402l-1.5-2.598c-3.068.51-4.452-.288-5.544-3.201Z"
                ></path>
                <circle cx="12" cy="12" r="2.5" fill="currentColor"></circle>
              </svg>
              <div
                className={`absolute top-12 sm:top-15 right-20 sm:right-28 md:right-34 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-gray-300/20 rounded-2xl transition-all duration-200 ease-in-out ${
                  isSettingOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                <div
                  className={`${
                    theme == "light" ? "bg-gray-400/20" : ""
                  } p-1.5 sm:p-2 hover:bg-gray-400/20 rounded cursor-pointer`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="sm:w-4 sm:h-4"
                    onClick={() => setTheme("light")}
                  >
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2"></path>
                    <path d="M12 20v2"></path>
                    <path d="m4.93 4.93 1.41 1.41"></path>
                    <path d="m17.66 17.66 1.41 1.41"></path>
                    <path d="M2 12h2"></path>
                    <path d="M20 12h2"></path>
                    <path d="m6.34 17.66-1.41 1.41"></path>
                    <path d="m19.07 4.93-1.41 1.41"></path>
                  </svg>
                </div>
                <div
                  className={`${
                    theme == "dark" ? "bg-gray-400/20 text-white" : ""
                  } p-1.5 sm:p-2 hover:bg-gray-400/20 rounded cursor-pointer`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-moon-star sm:w-4 sm:h-4"
                    onClick={() => setTheme("dark")}
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"></path>
                    <path d="M20 3v4"></path>
                    <path d="M22 5h-4"></path>
                  </svg>
                </div>
                <div
                  className={`${
                    theme == "system" ? "bg-gray-400/20" : ""
                  } p-1.5 sm:p-2 hover:bg-gray-400/20 rounded cursor-pointer`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-monitor-smartphone sm:w-4 sm:h-4 "
                    onClick={() => setTheme("light")}
                  >
                    <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8"></path>
                    <path d="M10 19v-3.96 3.15"></path>
                    <path d="M7 19h5"></path>
                    <rect width="6" height="10" x="16" y="12" rx="2"></rect>
                  </svg>
                </div>
              </div>
            </button>

            <button
              className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-gray-300/40 text-black mr-1 sm:mr-2 md:mr-4 rounded-full hover:bg-gray-200 transition cursor-pointer text-[11px] sm:text-[12px] md:text-[13px] dark:bg-white dark:text-black dark:hover:bg-white/90"
              onClick={() => {
                setIsLoginOpen(true);
                setIsNavOpen(false);
                setIsScrolled(false);
              }}
            >
              {isLoggedIn ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              ) : (
                "Log in"
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal - Outside header, same level as Login Modal */}
      {isSearchOpen && (
        <>
          {/* BACKDROP – full screen */}
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm z-50 dark:bg-black/20 dark:text-white"></div>

          {/* Close Button */}
          <div className="fixed top-4 sm:top-5 right-6 sm:right-9 md:right-39 z-50 cursor-pointer">
            <svg
              width="24"
              height="24"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="sm:w-[30px] sm:h-[30px]"
              onClick={() => setIsSearchOpen(false)}
            >
              <path
                d="M4.23431 4.23431C4.54673 3.9219 5.05327 3.9219 5.36569 4.23431L8 6.86863L10.6343 4.23431C10.9467 3.9219 11.4533 3.9219 11.7657 4.23431C12.0781 4.54673 12.0781 5.05327 11.7657 5.36569L9.13137 8L11.7657 10.6343C12.0781 10.9467 12.0781 11.4533 11.7657 11.7657C11.4533 12.0781 10.9467 12.0781 10.6343 11.7657L8 9.13137L5.36569 11.7657C5.05327 12.0781 4.54673 12.0781 4.23431 11.7657C3.9219 11.4533 3.9219 10.9467 4.23431 10.6343L6.86863 8L4.23431 5.36569C3.9219 5.05327 3.9219 4.54673 4.23431 4.23431Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <div className="fixed top-40 sm:top-45 left-1/2 -translate-y-10 z-50 flex items-center -translate-x-1/2 px-4 sm:px-0 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Ask me about our team"
              className="border-b px-2 sm:px-3 py-2 outline-none text-lg sm:text-xl md:text-2xl pointer-events-auto w-full sm:w-lg"
              autoFocus
            />
            <svg
              width="30"
              height="30"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-8 sm:ml-6 border-black bg-black/90 rounded-full hover:bg-black/70 text-white cursor-pointer dark:text-black dark:bg-white sm:w-[35px] sm:h-[35px] hrink-0"
            >
              <path
                d="M16 22L16 10M16 10L11 15M16 10L21 15"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </div>
        </>
      )}

      {/* Login Modal */}
      {isLoginOpen && (
        <>
          {/* BACKDROP – full screen */}
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 dark:bg-black/40"
            onClick={() => setIsLoginOpen(false)}
          ></div>

          {/* MODAL CONTAINER – centered */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none -translate-y-10 sm:-translate-y-20 transition-all duration-300 px-4 ">
            <div
              className="bg-white/60 w-lg max-w-xs sm:max-w-sm rounded-2xl px-6 sm:px-8 py-13 pointer-events-auto shadow-sm dark:bg-gray-700/30 dark:text-white "
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="email"
                placeholder="Email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="border-b-2 w-full px-2 py-2 mb-4 sm:mb-5 text-black outline-none dark:text-white text-[13px] sm:text-[13px]"
              />
              <div className="flex items-center justify-center">
                <input
                  type="password"
                  placeholder="Password"
                  value={user.password}
                  onChange={(e) =>
                    setUser({ ...user, password: e.target.value })
                  }
                  className="border-b-2 w-full px-2 py-2 mb-7 text-black outline-none dark:text-white text-sm sm:text-[13px]"
                />
                <svg
                  width="16"
                  height="16"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="cursor-pointer ml-2 sm:ml-3 sm:w-[18px] sm:h-[18px] shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8 2.5C3 2.5 0 8 0 8C0 8 3 13.5 8 13.5C13 13.5 16 8 16 8C16 8 13 2.5 8 2.5ZM10.4749 10.4749C9.8185 11.1313 8.92826 11.5 8 11.5C7.07174 11.5 6.1815 11.1313 5.52513 10.4749C4.86875 9.8185 4.5 8.92826 4.5 8C4.5 7.07174 4.86875 6.1815 5.52513 5.52513C6.1815 4.86875 7.07174 4.5 8 4.5C8.92826 4.5 9.8185 4.86875 10.4749 5.52513C11.1313 6.1815 11.5 7.07174 11.5 8C11.5 8.92826 11.1313 9.8185 10.4749 10.4749ZM9.76777 9.76777C10.2366 9.29893 10.5 8.66304 10.5 8C10.5 7.33696 10.2366 6.70107 9.76777 6.23223C9.29893 5.76339 8.66304 5.5 8 5.5C7.33696 5.5 6.70107 5.76339 6.23223 6.23223C5.76339 6.70107 5.5 7.33696 5.5 8C5.5 8.66304 5.76339 9.29893 6.23223 9.76777C6.70107 10.2366 7.33696 10.5 8 10.5C8.66304 10.5 9.29893 10.2366 9.76777 9.76777Z"
                  ></path>
                </svg>
              </div>
              <button
                className="w-full bg-black text-[#aeaeaf] py-2 sm:py-2 md:py-3 rounded-full hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90 text-sm sm:text-base"
                onClick={onLogin}
              >
                <div className="cursor-pointer">SIGN IN {loading}</div>
              </button>
              <div className="flex justify-center items-center">
                <button className="w-fit sm:w-[60%] mt-2 text-white pr-3 sm:pr-3 rounded-full bg-black flex justify-between items-center hover:bg-black/80 cursor-pointer dark:bg-white dark:text-black dark:hover:bg-white/90 text-xs sm:text-sm">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="bg-white p-1 sm:p-1 md:p-2 rounded-full text-black dark:bg-black"
                    width={32}
                    height={32}
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
                  <div className="pl-2 md:pl-0 ">Continue with Google</div>
                </button>
              </div>
              <div className="flex justify-center items-center gap-2 sm:gap-3 pt-3 sm:pt-4 text-xs sm:text-[13px]">
                <Link
                  href="/forget password"
                  className="text-black dark:text-white"
                >
                  Forgot Password
                </Link>
                <Link href="/Signup" className="text-black dark:text-white">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Navbar */}
      <nav
        className={`fixed h-screen bg-white transition-transform duration-300 z-30 sm:w-64 w-56 top-0 dark:text-white dark:bg-black   ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className=" mt-40 flex flex-col gap-7 text-sm  pl-6 sm:pl-10 text-black dark:text-white dark:bg-black  ">
          <li>
            <Link
              href="/"
              className={` ${
                pathname == "/"
                  ? "text-gray-700/70 hover:text-black dark:text-gray-200/60 dark:hover:text-white"
                  : ""
              } hover:text-xl  transition-all duration-400 cursor-pointer hover:pl-6  pr-24   `}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/Enhancer"
              className={` ${
                pathname == "/Enhancer"
                  ? "text-gray-700/70 hover:text-black dark:text-gray-200/60 dark:hover:text-white"
                  : ""
              }   hover:text-xl  transition-all duration-400 cursor-pointer hover:pl-4  py-3 pr-1  `}
            >
              Prompt Enhancer
            </Link>
          </li>
          <li>
            <Link
              href="/Templates"
              className={` ${
                pathname == "/templates"
                  ? "text-gray-700/70 hover:text-black dark:text-gray-200/60 dark:hover:text-white"
                  : ""
              }  hover:text-xl  transition-all duration-400 cursor-pointer  hover:pl-4 py-3      `}
            >
              Prompt Templates
            </Link>
          </li>
          <li>
            <Link
              href="/Engineering"
              className={` ${
                pathname == "/guides"
                  ? "text-gray-700/70 hover:text-black dark:text-gray-200/60 dark:hover:text-white"
                  : ""
              }  hover:text-xl  transition-all duration-400 cursor-pointer hover:pl-4 py-3   pr-1  `}
            >
              Prompt Engineering
            </Link>
          </li>
          <li>
            <Link
              href="/AITools"
              className={` ${
                pathname == "/AiTools"
                  ? "text-gray-700/70 hover:text-black dark:text-gray-200/60 dark:hover:text-white"
                  : ""
              }  hover:text-xl  transition-all duration-400 cursor-pointer hover:pl-4 py-3   pr-26  `}
            >
              AI Tools
            </Link>
          </li>
          <li>
            <Link
              href="/Learn"
              className={` ${
                pathname == "/learn"
                  ? "text-gray-700/70 hover:text-black dark:text-gray-200/60 dark:hover:text-white"
                  : ""
              }  hover:text-xl  transition-all duration-400 cursor-pointer hover:pl-4 py-3   pr-30   `}
            >
              Learn
            </Link>
          </li>
          <li>
            <Link
              href="/Pricing"
              className={` ${
                pathname == "/pricing"
                  ? "text-gray-700/70 hover:text-black dark:text-gray-200/60 dark:hover:text-white"
                  : ""
              } hover:text-xl  transition-all duration-400 cursor-pointer  hover:pl-4 py-3   pr-29  `}
            >
              Pricing
            </Link>
          </li>
          <li>
            <Link
              href="/Teams"
              className={` ${
                pathname == "/teams"
                  ? "text-gray-700/70 hover:text-black dark:text-gray-200/60 dark:hover:text-white"
                  : ""
              } hover:text-xl  transition-all duration-400 cursor-pointer  hover:pl-4 py-3    pr-20 `}
            >
              For Teams
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
