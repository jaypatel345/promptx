"use client";

import { useUi } from "@/context/UiContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/theme-context";
// import { Router } from "next/router";
import SiteAssistantModal from "@/components/SiteAssistantModal";
import { apiClient } from "@/lib/apiClient";
import { API_BASE } from "@/lib/apiBase";

export default function Header() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(true);

  const { isNavOpen, setIsNavOpen, isLoginOpen, setIsLoginOpen } = useUi();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const pathname = usePathname();
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [headerKey, setHeaderKey] = useState(0);

  function checkScrollPosition() {
    const fullScreen = window.innerHeight;
    const halfScreen = fullScreen * 0.5;

    const threshold = fullScreen + halfScreen; // 1.5 screen

    return window.scrollY >= threshold;
  }
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  type NavLink = { label: string; href: string };

  const navLinks: NavLink[] = [
    { label: "Prompt Enhancer", href: "/enhancer" },
    { label: "Prompt Templates", href: "/Templates" },
    { label: "Prompt Engineering", href: "/engineering" },
    { label: "AI Tools", href: "/ai-tools" },
    { label: "Learn", href: "/learn" },
    { label: "Pricing", href: "/Pricing" },
    { label: "For Teams", href: "/Teams" },
  ];

  const grokStyles = `
@keyframes grokDropdown {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
`;
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
    const checkLogin = async () => {
      try {
        // Check localStorage cache first
        const cachedAuth = localStorage.getItem('authState');
        const cachedProfile = localStorage.getItem('userProfile');
        
        if (cachedAuth && cachedProfile) {
          const authData = JSON.parse(cachedAuth);
          const profileData = JSON.parse(cachedProfile);
          
          // Use cached data immediately
          setIsLoggedIn(authData.isLoggedIn);
          setUserProfile(profileData);
          setAuthChecked(true);
          
          // Verify in background without blocking UI
          apiClient.get(`/user/me`).then(res => {
            const isGuest = !!res.data?.data?.isGuest;
            const dataUser = res.data?.data?.user || null;
            const newIsLoggedIn = !!res.data?.success && !!dataUser && !isGuest;
            
            // Update if state changed
            if (newIsLoggedIn !== authData.isLoggedIn || 
                JSON.stringify(dataUser) !== JSON.stringify(profileData)) {
              setIsLoggedIn(newIsLoggedIn);
              setUserProfile(!isGuest ? dataUser : null);
              
              // Update cache
              localStorage.setItem('authState', JSON.stringify({ isLoggedIn: newIsLoggedIn }));
              localStorage.setItem('userProfile', JSON.stringify(!isGuest ? dataUser : null));
            }
          }).catch(error => {
            console.error("Auth verification failed:", error);
            // Clear cache on error
            localStorage.removeItem('authState');
            localStorage.removeItem('userProfile');
            setIsLoggedIn(false);
            setUserProfile(null);
          });
        } else {
          // No cache, make API call
          const res = await apiClient.get(`/user/me`);
          const isGuest = !!res.data?.data?.isGuest;
          const dataUser = res.data?.data?.user || null;
          const newIsLoggedIn = !!res.data?.success && !!dataUser && !isGuest;
          
          setIsLoggedIn(newIsLoggedIn);
          setUserProfile(!isGuest ? dataUser : null);
          
          // Cache the results
          localStorage.setItem('authState', JSON.stringify({ isLoggedIn: newIsLoggedIn }));
          localStorage.setItem('userProfile', JSON.stringify(!isGuest ? dataUser : null));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoggedIn(false);
        setUserProfile(null);
        // Clear cache on error
        localStorage.removeItem('authState');
        localStorage.removeItem('userProfile');
      } finally {
        setAuthChecked(true);
      }
    };

    checkLogin();
  }, []);

  // Update logout function to reset authChecked

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const onLogin = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const response = await apiClient.post(`/auth/login`,         {
          email: user.email,
          password: user.password,
        }      );

      if (response.data?.success) {
        const me = await apiClient.get(`/user/me`);
        const isGuest = !!me.data?.data?.isGuest;
        const dataUser = me.data?.data?.user || null;
        const newIsLoggedIn = !!me.data?.success && !!dataUser && !isGuest;
        
        setIsLoggedIn(newIsLoggedIn);
        setUserProfile(!isGuest ? dataUser : null);
        
        // Update cache
        localStorage.setItem('authState', JSON.stringify({ isLoggedIn: newIsLoggedIn }));
        localStorage.setItem('userProfile', JSON.stringify(!isGuest ? dataUser : null));
        
        setAuthChecked(true);
        setIsLoginOpen(false);
        setHeaderKey((k) => k + 1);
      }
    } catch (error: any) {
      console.log("Login failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post(`/auth/logout`, {});
        setIsLoggedIn(false);
        setUserProfile(null);
        
        // Clear cache
        localStorage.removeItem('authState');
        localStorage.removeItem('userProfile');
          } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsProfileMenuOpen(false);
      setAuthChecked(true);
      setHeaderKey((k) => k + 1);
    }
  };
  return (
    <div key={headerKey} className="">
      <style>{grokStyles}</style>
      {/* Header */}
      <header
        className="
    fixed top-0 z-40 w-full backdrop-blur-md text-black 

    /* Mobile (default) */
    bg-white dark:bg-black

   xl:bg-linear-to-b xl:from-white/80 xl:to-white/40
xl:dark:bg-linear-to-b xl:dark:from-black/60 xl:dark:to-black/20
  "
      >
        <div className="relative flex justify-between items-center mx-3 sm:mx-4 md:mx-5 py-2.5 sm:py-3 overflow-visible">
          {/* Left: Logo */}
          <div className="flex items-center text-2xl sm:text-4xl font-semibold">
            <div className="relative h-10 w-auto">
              {/* logo */}
              <Link
                href="/"
                aria-label="Home"
                className={`absolute -left-8 top-0 transition-all duration-500 ease-in-out
      ${isScrolled ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"}
    `}
              >
                <Image
                  src={
                    theme === "light"
                      ? "/Rectangle.png"
                      : "/AdobeStock_450013573_Preview 1.png"
                  }
                  width={100}
                  height={100}
                  alt="promptx logo"
                  priority
                  className="ml-10 sm:ml-13 mt-1.5 w-40 h-8 md:h-8  object-contain "
                />
              </Link>
            </div>
          </div>

          {/* Center: Nav Links (Desktop) */}
          <nav className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 text-[14px] font-medium text-black/60 dark:text-white/60">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`hover:text-black dark:hover:text-white transition-colors whitespace-nowrap ${
                  pathname === item.href ? "text-black dark:text-white" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Search + Login */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
{/* Mobile Nav Toggle */}
            <button
              aria-label={isNavOpen ? "Close menu" : "Open menu"}
              className="xl:hidden p-1 sm:p-2 rounded-full hover:bg-gray-100 transition dark:hover:bg-gray-700/40"
              onClick={() => setIsNavOpen(!isNavOpen)}
            >
              {isNavOpen ? (
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
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
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
                >
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>

{/* Search Button */}
            <button
              aria-label="Search"
              className={`p-1 sm:p-2 rounded-full hover:bg-gray-100 transition dark:hover:bg-gray-700/40 md:ml-0 ml-3 ${
                pathname === "/" ? "" : "hidden"
              }`}
              onClick={() => {
                  setIsSearchOpen(true);
                  setIsLoginOpen(false);
                }}
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
                              >
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="16.65" y1="16.65" x2="21" y2="21"></line>
              </svg>
            </button>

            {/* Right Slot */}
            <div className="w-[88px] sm:w-24 flex justify-end">
              {userProfile ? (
                /* LOGGED IN STATE */
                <div
                  ref={profileMenuRef}
                  className="relative z-999 flex items-center justify-center mr-5 overflow-visible"
                >
{/* Avatar Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileMenuOpen((v) => !v);
                    }}
                    className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-gray-200 dark:bg-neutral-700"
                                      >
                    {userProfile?.avatar?.trim() ? (
                      <img
                        src={userProfile.avatar}
                        alt="User avatar"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                                                    e.currentTarget.src = "/avatar.svg";
                        }}
                      />
                    ) : (
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
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </button>

{/* Dropdown */}
                  {isProfileMenuOpen && (
                    <div                       className="absolute z-1000 w-44 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700       top-full mt-1 right-0">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 text-sm">
                        Settings
                      </button>
                      <Link 
                        href="/Pricing"
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 text-sm block"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Upgrade plan
                      </Link>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 text-sm">
                        Help
                      </button>

                      <div className="h-px bg-gray-200 dark:bg-neutral-700 my-1" />

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* NOT LOGGED IN STATE */
                <button
                  className="px-4 sm:px-4 md:px-5 py-2 bg-gray-300/40 text-black rounded-full hover:bg-gray-200 transition text-[13px] dark:bg-white dark:text-black dark:hover:bg-white/90"
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsNavOpen(false);
                    setIsScrolled(false);
                  }}
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isNavOpen && (
          <nav className="xl:hidden absolute top-full left-0 w-full bg-white dark:bg-black border-t border-gray-100 dark:border-neutral-800 shadow-sm">
            <ul className="flex flex-col px-4 sm:px-5 py-2 text-sm">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setIsNavOpen(false)}
                    className={`block py-3 hover:text-black dark:hover:text-white transition-colors ${
                      pathname === item.href
                        ? "text-black dark:text-white"
                        : "text-black/70 dark:text-white/70"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* SiteAssistantModal replaces legacy search modal */}
      <SiteAssistantModal
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Login Modal */}
      {isLoginOpen && (
        <>
          {/* BACKDROP – full screen */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 dark:bg-white/20"
            onClick={() => setIsLoginOpen(false)}
          ></div>

          {/* MODAL CONTAINER – centered */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none -translate-y-10 sm:-translate-y-20 transition-all duration-300 px-4 ">
            <div
              className="bg-white/70 w-lg max-w-xs sm:max-w-sm rounded-2xl px-10 sm:px-8 py-8 pointer-events-auto shadow-sm dark:bg-black/70 dark:text-white "
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(false)}
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

              {/*  FORM: Enter key will trigger submit */}
              <form onSubmit={onLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  disabled={loading}
                  className="border-b border-gray-300 w-full px-2 py-2 mb-4 sm:mb-5 text-black outline-none dark:text-white text-sm sm:text-[15px] focus:border-gray-500 dark:focus:border-neutral-500"
                />

                <div className="flex items-center justify-center">
                  <input
                    type="password"
                    placeholder="Password"
                    value={user.password}
                    onChange={(e) =>
                      setUser({ ...user, password: e.target.value })
                    }
                    disabled={loading}
                    className="border-b border-gray-300 w-full px-2 py-2 mb-9 text-black outline-none dark:text-white  sm:text-[15px] text-sm focus:border-gray-500 dark:focus:border-neutral-500"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full bg-black text-[#aeaeaf] py-2 sm:py-2 md:py-3 rounded-full hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90 text-sm sm:text-base flex items-center justify-center gap-2 ${
                    loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                        />
                      </svg>
                      <span className="text-sm">Signing in...</span>
                    </>
                  ) : (
                    <span className="text-sm">SIGN IN</span>
                  )}
                </button>
              </form>

              {/* Google button (kept OUTSIDE form so it won't submit on click) */}
              <div className="flex justify-center items-center">
                <button
                  type="button"
                  className="w-fit sm:w-[60%] mt-2 text-white pr-3 sm:pr-3 rounded-full bg-black flex justify-between items-center hover:bg-black/80 cursor-pointer dark:bg-white dark:text-black dark:hover:bg-white/90 text-xs sm:text-sm"
                >
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

                  <div
                    className="pl-2 md:-pl-5 text-sm"
                    onClick={handleGoogleLogin}
                  >
                    Continue with Google
                  </div>
                </button>
              </div>

              <div className="flex justify-center items-center gap-1 sm:gap-2 pt-3 sm:pt-4 text-xs sm:text-[13px]">
                <Link
                  href="/forget-password"
                  className="text-black/60 dark:text-white"
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

    </div>
  );
}
