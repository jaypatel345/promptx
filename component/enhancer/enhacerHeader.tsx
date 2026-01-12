import { useTheme } from "@/context/theme-context";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useUi } from "@/context/UiContext";
import { usePathname } from "next/navigation";
import axios from "axios";

function EnhacerHeader() {
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = React.useState<string>("");
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const { isOpen, setIsOpen } = useUi();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isNavOpen, setIsNavOpen, isLoginOpen, setIsLoginOpen } = useUi();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const onLogin = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (loading) return; // prevent double submit

    try {
      setLoading(true);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        email: user.email,
        password: user.password,
      });

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        setIsLoggedIn(true);
      }

      setIsLoginOpen(false);
    } catch (error: any) {
      console.log("Login failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="flex justify-between ">
        <div
          className={`flex flex-col transition-all duration-400 pr-5 h-screen border-r border-gray-200 dark:border-neutral-600 z-50   bg-white dark:bg-black ${
            isOpen ? "w-56 opacity-100" : "w-15 opacity-100 overflow-hidden"
          }`}
        >
          <div>
            <Link href="/" aria-label="Home" className="">
              <Image
                src={
                  theme === "light"
                    ? "/Rectangle.png"
                    : "/AdobeStock_450013573_Preview 1.png"
                }
                width={30}
                height={10}
                alt="promptx logo"
                className="ml-2 sm:ml-2.5 mt-4  w-9 h-4 md:h-7 "
              />
            </Link>
          </div>
          <div
            className={`mt-5 ml-2 flex items-center gap-1 pl-3 py-2.5 pr-5 border border-gray-200 rounded-4xl bg-gray-100 transition-all dark:bg-neutral-800 ${
              isOpen ? "opacity-100" : "opacity-0 pointer-events-none  "
            }`}
          >
            {/* Search icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={20}
              height={20}
              className="shrink-0 text-gray-900"
            >
              <g transform="translate(12 11.5)">
                <path
                  stroke={theme === "light" ? "#000000" : "#ffffff"}
                  strokeWidth={2}
                  fill="none"
                  d="M7,-0.75 C7,1.39 6.132,3.328 4.73,4.73
           C3.328,6.132 1.39,7 -0.75,7
           C-5.03,7 -8.5,3.53 -8.5,-0.75
           C-8.5,-5.03 -5.03,-8.5 -0.75,-8.5
           C3.53,-8.5 7,-5.03 7,-0.75z
           M4.73,4.73 L8.5,8.5"
                />
              </g>
            </svg>

            {/* Textarea */}
            <textarea
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              rows={1}
              aria-label="Search"
              className="flex-1 resize-none bg-transparent outline-none text-[15px] ml-1.5 placeholder-gray-400"
            />
          </div>
          <div
            className={`mt-2 ml-2 flex flex-row items-center gap-1 pl-3 py-2.5 pr-5  rounded-2xl  transition-all duration-200 dark:hover:bg-neutral-700/60 cursor-pointer
            ${isOpen ? "hover:bg-gray-100" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={20}
              height={20}
              className="shrink-0"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <clipPath id="lottie_clip_7">
                  <rect width={24} height={24} x={0} y={0} />
                </clipPath>

                <clipPath id="lottie_clip_12">
                  <path d="M-12.222,-12.222 L-12.111,12.111 L12.056,12.056 L12.083,-12.083 Z" />
                </clipPath>
              </defs>

              <g clipPath="url(#lottie_clip_7)">
                <g clipPath="url(#lottie_clip_12)" transform="translate(12 12)">
                  <path
                    d="M-2,-8 C-3.864,-8 -4.796,-8 -5.531,-7.696 C-6.511,-7.29 -7.29,-6.511 -7.696,-5.531 C-8,-4.796 -8,-3.864 -8,-2 V1.6 C-8,3.84 -8,4.96 -7.564,5.816 C-7.181,6.569 -6.569,7.181 -5.816,7.564 C-4.96,8 -3.84,8 -1.6,8 H2 C3.864,8 4.796,8 5.531,7.696 C6.511,7.29 7.29,6.511 7.696,5.531 C8,4.796 8,3.864 8,2"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    fill="none"
                  />
                </g>

                <g transform="translate(14.561 9.439)">
                  <path
                    d="M4.939,-1.939 L-2.121,5.121 C-2.402,5.402 -2.784,5.561 -3.182,5.561 H-5.561 V3.182 C-5.561,2.784 -5.402,2.402 -5.121,2.121 L1.939,-4.939 C2.767,-5.767 4.111,-5.767 4.939,-4.939 C5.767,-4.111 5.767,-2.767 4.939,-1.939 Z"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    fill="none"
                  />
                </g>
              </g>
            </svg>
            {isOpen && (
              <span className="ml-2 flex  flex-row font-medium text-[15px] ">
                Chat
              </span>
            )}
          </div>
          <div
            className={`mt-1 ml-2 flex flex-row items-center gap-1 pl-3 py-2.5 pr-5  rounded-2xl  transition-all duration-200 dark:hover:bg-neutral-700/60 cursor-pointer
            ${isOpen ? "hover:bg-gray-100" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={20}
              height={20}
              className="shrink-0"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <clipPath id="lottie_clip_371">
                  <rect width={24} height={24} x={0} y={0} />
                </clipPath>
              </defs>

              <g clipPath="url(#lottie_clip_371)">
                {/* Bottom rounded bar */}
                <g transform="translate(12 15.25)">
                  <path
                    d="M-8.5,-4.25 H8.5 V-2.15 C8.5,0.09 8.5,1.21 8.064,2.066 C7.681,2.819 7.069,3.431 6.316,3.814 C5.46,4.25 4.34,4.25 2.1,4.25 H-2.1 C-4.34,4.25 -5.46,4.25 -6.316,3.814 C-7.069,3.431 -7.681,2.819 -8.064,2.066 C-8.5,1.21 -8.5,0.09 -8.5,-2.15 Z"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    fill="none"
                  />
                </g>

                {/* Top container */}
                <g transform="translate(12 8.25)">
                  <path
                    d="M8.5,3.75 V-1.75 H1 L-3,-3.75 H-8.5 V3.75"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    fill="none"
                  />
                </g>
              </g>
            </svg>

            {isOpen && (
              <span className="ml-2 flex  flex-row font-medium text-[15px]   ">
                Project
              </span>
            )}
          </div>
          <div
            className={`mt-1 ml-2 flex flex-row items-center gap-1 pl-3 py-2.5 pr-5  rounded-2xl  transition-all duration-200 dark:hover:bg-neutral-700/60 cursor-pointer
            ${isOpen ? "hover:bg-gray-100" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={20}
              height={20}
              className="shrink-0"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <clipPath id="lottie_clip_402">
                  <rect width={24} height={24} x={0} y={0} />
                </clipPath>
              </defs>

              <g clipPath="url(#lottie_clip_402)">
                {/* vertical line */}
                <g transform="translate(12 14)">
                  <path
                    d="M0 2 V-2"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="butt"
                    fill="none"
                  />
                </g>

                {/* center dot */}
                <g transform="translate(12 12)">
                  <circle cx={0} cy={0} r={1} fill="currentColor" />
                </g>

                {/* diagonal slash */}
                <g transform="translate(13.5 10.5)">
                  <path
                    d="M-1.5 1.5 L1.5 -1.5"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="butt"
                    fill="none"
                  />
                </g>

                {/* circular arrow */}
                <g transform="translate(12.029 11.75)">
                  <path
                    d="M-8.471 1.25 C-7.976 5.473 -4.385 8.75 -0.029 8.75
           C4.665 8.75 8.471 4.944 8.471 0.25
           C8.471 -4.444 4.665 -8.25 -0.029 -8.25
           C-3.276 -8.25 -6.098 -6.43 -7.529 -3.754
           M-2.529 -3.75 H-7.529 V-8.75"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    fill="none"
                  />
                </g>
              </g>
            </svg>
            {isOpen && (
              <span className="ml-2 flex  flex-row font-medium text-[15px]   ">
                History
              </span>
            )}
          </div>
          <div className="mt-auto ml-2 flex flex-col items-start pb-5">
            <div className="">
              {isOpen && <span className="ml-2 font-medium "></span>}
            </div>
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer mt-3 ml-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`lucide lucide-chevrons-right transition-transform duration-900 ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <path d="m6 17 5-5-5-5" />
                <path d="m13 17 5-5-5-5" />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-3 right-4 z-50">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          
            <button
              aria-label="Settings"
              className={`p-1 sm:p-2  rounded-full hover:bg-gray-100 transition dark:text-gray-50  dark:hover:bg-gray-500/40 ${
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
                className={`absolute top-12 sm:top-10 right-20 sm:right-20 md:right-30 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-gray-300/20 rounded-2xl transition-all duration-200 ease-in-out ${
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
      </div>
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

              {/* ✅ FORM: Enter key will trigger submit */}
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

                  <svg
                    width="16"
                    height="16"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="cursor-pointer ml-2 sm:ml-3 sm:w-[18px] sm:h-[18px] shrink-0 mb-3"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 2.5C3 2.5 0 8 0 8C0 8 3 13.5 8 13.5C13 13.5 16 8 16 8C16 8 13 2.5 8 2.5ZM10.4749 10.4749C9.8185 11.1313 8.92826 11.5 8 11.5C7.07174 11.5 6.1815 11.1313 5.52513 10.4749C4.86875 9.8185 4.5 8.92826 4.5 8C4.5 7.07174 4.86875 6.1815 5.52513 5.52513C6.1815 4.86875 7.07174 4.5 8 4.5C8.92826 4.5 9.8185 4.86875 10.4749 5.52513C11.1313 6.1815 11.5 7.07174 11.5 8C11.5 8.92826 11.1313 9.8185 10.4749 10.4749ZM9.76777 9.76777C10.2366 9.29893 10.5 8.66304 10.5 8C10.5 7.33696 10.2366 6.70107 9.76777 6.23223C9.29893 5.76339 8.66304 5.5 8 5.5C7.33696 5.5 6.70107 5.76339 6.23223 6.23223C5.76339 6.70107 5.5 7.33696 5.5 8C5.5 8.66304 5.76339 9.29893 6.23223 9.76777C6.70107 10.2366 7.33696 10.5 8 10.5C8.66304 10.5 9.29893 10.2366 9.76777 9.76777Z"
                    ></path>
                  </svg>
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

                  <div className="pl-2 md:-pl-5 text-sm">
                    Continue with Google
                  </div>
                </button>
              </div>

              <div className="flex justify-center items-center gap-1 sm:gap-2 pt-3 sm:pt-4 text-xs sm:text-[13px]">
                <Link
                  href="/forget password"
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

export default EnhacerHeader;
