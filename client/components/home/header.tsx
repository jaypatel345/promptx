"use client";

import { useUi } from "@/context/UiContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/theme-context";
import SiteAssistantModal from "@/components/SiteAssistantModal";
import LoginModal from "@/components/auth/LoginModal";
import { apiClient } from "@/lib/apiClient";
import { API_BASE } from "@/lib/apiBase";

export default function Header() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const { isNavOpen, setIsNavOpen, isLoginOpen, setIsLoginOpen } = useUi();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
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

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  type NavLink = { label: string; href: string };

  const navLinks: NavLink[] = [
    { label: "Templates", href: "/templates" },
    { label: "Prompt Engineering", href: "/prompt-engineering" },
    { label: "Pricing", href: "/pricing" },
  ];

  // Close mobile nav on resize
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setIsNavOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsNavOpen]);

  // Auth checking
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const cachedAuth = localStorage.getItem("authState");
        const cachedProfile = localStorage.getItem("userProfile");

        if (cachedAuth && cachedProfile) {
          const authData = JSON.parse(cachedAuth);
          const profileData = JSON.parse(cachedProfile);

          setIsLoggedIn(authData.isLoggedIn);
          setUserProfile(profileData);
          setAuthChecked(true);

          apiClient
            .get(`/user/me`)
            .then((res) => {
              const isGuest = !!res.data?.data?.isGuest;
              const dataUser = res.data?.data?.user || null;
              const newIsLoggedIn = !!res.data?.success && !!dataUser && !isGuest;

              if (
                newIsLoggedIn !== authData.isLoggedIn ||
                JSON.stringify(dataUser) !== JSON.stringify(profileData)
              ) {
                setIsLoggedIn(newIsLoggedIn);
                setUserProfile(!isGuest ? dataUser : null);

                localStorage.setItem(
                  "authState",
                  JSON.stringify({ isLoggedIn: newIsLoggedIn })
                );
                localStorage.setItem(
                  "userProfile",
                  JSON.stringify(!isGuest ? dataUser : null)
                );
              }
            })
            .catch(() => {
              localStorage.removeItem("authState");
              localStorage.removeItem("userProfile");
              setIsLoggedIn(false);
              setUserProfile(null);
            });
        } else {
          const res = await apiClient.get(`/user/me`);
          const isGuest = !!res.data?.data?.isGuest;
          const dataUser = res.data?.data?.user || null;
          const newIsLoggedIn = !!res.data?.success && !!dataUser && !isGuest;

          setIsLoggedIn(newIsLoggedIn);
          setUserProfile(!isGuest ? dataUser : null);

          localStorage.setItem(
            "authState",
            JSON.stringify({ isLoggedIn: newIsLoggedIn })
          );
          localStorage.setItem(
            "userProfile",
            JSON.stringify(!isGuest ? dataUser : null)
          );
        }
      } catch {
        setIsLoggedIn(false);
        setUserProfile(null);
        localStorage.removeItem("authState");
        localStorage.removeItem("userProfile");
      } finally {
        setAuthChecked(true);
      }
    };

    checkLogin();

    const handleAuthChange = () => {
      checkLogin();
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  // Close profile dropdown outside click
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

      const response = await apiClient.post(`/auth/login`, {
        email: user.email,
        password: user.password,
      });

      if (response.data?.success) {
        const me = await apiClient.get(`/user/me`);
        const isGuest = !!me.data?.data?.isGuest;
        const dataUser = me.data?.data?.user || null;
        const newIsLoggedIn = !!me.data?.success && !!dataUser && !isGuest;

        setIsLoggedIn(newIsLoggedIn);
        setUserProfile(!isGuest ? dataUser : null);

        localStorage.setItem(
          "authState",
          JSON.stringify({ isLoggedIn: newIsLoggedIn })
        );
        localStorage.setItem(
          "userProfile",
          JSON.stringify(!isGuest ? dataUser : null)
        );

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
      localStorage.removeItem("authState");
      localStorage.removeItem("userProfile");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsProfileMenuOpen(false);
      setAuthChecked(true);
      setHeaderKey((k) => k + 1);
    }
  };

  return (
    <div key={headerKey} className="relative z-50">
      <header className="fixed top-0 left-0 w-full z-40 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-md transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Left: Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              aria-label="PromptX Home"
              className="flex items-center transition-opacity hover:opacity-90"
            >
              <Image
                src="/promptx-logo-black.png"
                width={28}
                height={28}
                alt="PromptX logo"
                priority
                style={{ width: "auto" }}
                className="h-6 sm:h-[25px] object-contain dark:hidden"
              />
              <Image
                src="/promptx-logo-white.png"
                width={28}
                height={28}
                alt="PromptX logo"
                priority
                style={{ width: "auto" }}
                className="h-6 sm:h-[25px] object-contain hidden dark:block"
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
            {navLinks.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? "text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-900 font-medium"
                      : "hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search / Assistant Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search prompt templates and tools"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              {theme === "dark" ? (
                // Sun icon for dark mode
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                // Moon icon for light mode
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Auth Slot */}
            {userProfile ? (
              <div ref={profileMenuRef} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileMenuOpen((v) => !v);
                  }}
                  className="w-7 h-7 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800"
                >
                  {userProfile?.avatar?.trim() ? (
                    <img
                      src={userProfile.avatar}
                      alt="User avatar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/avatar.svg";
                      }}
                    />
                  ) : (
                    <span className="text-xs font-medium uppercase font-mono">
                      {userProfile.email?.[0] || "U"}
                    </span>
                  )}
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-1.5 shadow-xs text-xs">
                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-900 mb-1">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {userProfile.email}
                      </p>
                      <p className="text-[11px] text-neutral-500">Free Tier</p>
                    </div>
                    <Link
                      href="/pricing"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    >
                      Upgrade to Pro
                    </Link>
                    <Link
                      href="/enhancer"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    >
                      Prompt Builder
                    </Link>
                    <div className="h-px bg-neutral-100 dark:bg-neutral-900 my-1" />
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Log in
                </button>
              </div>
            )}

            {/* Mobile Nav Hamburger */}
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              aria-label={isNavOpen ? "Close menu" : "Open menu"}
              className="md:hidden p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              {isNavOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isNavOpen && (
          <nav className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-4 py-3 space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsNavOpen(false)}
                className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  pathname === item.href
                    ? "text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-900"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Site Assistant Modal */}
      <SiteAssistantModal
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Login Modal */}
      <LoginModal
        open={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={(user) => {
          setIsLoggedIn(true);
          setUserProfile(user);
          setHeaderKey((k) => k + 1);
        }}
      />
    </div>
  );
}
