"use client";
import React, { useEffect, useState } from "react";
import Header from "../home/header";
import { useUi } from "@/context/UiContext";
import { useTheme } from "@/context/theme-context";
import Image from "next/image";

function Enhancer() {
  const { isNavOpen, setIsNavOpen } = useUi();
   const { theme, setTheme } = useTheme();

  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    // Only close if the user directly landed on this page (no referrer from your site)
    if (isMobile && !document.referrer.includes(window.location.hostname)) {
      setIsNavOpen(false);
    }
  }, [setIsNavOpen]);
  return (
    <>
      <div className="flex flex-col min-h-screen dark:bg-black bg-white">
        <Header />
        <div
          className={`flex flex-col items-center justify-center grow mt-42 sm:mt-40 md:mt-50 lg:mt-70 transition-all duration-300 px-4 sm:px-6  ${
            isNavOpen ? "translate-x-70 md:translate-x-20" : "translate-x-0"
          }`}
        >
          <div className="flex  justify-center">
            <Image
              src={
                    theme === "light"
                      ? "/Rectangle.png"
                      : "/AdobeStock_450013573_Preview 1.png"
                  }
              width={100}
              height={100}
              alt="promptx logo"
              className=" absolute bottom-[40%] w-24 h-24 md:h-16 opacity-10 "
            />
          </div>
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-black font-medium mb-4 sm:mb-5 dark:text-white text-center">
            What can I help with?
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-full w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl px-2 sm:px-3 py-2 flex items-center gap-1 sm:gap-2 shadow-md dark:bg-[#0f0f0f]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="m-1 sm:m-2 font-medium cursor-pointer text-black dark:text-white shrink-0"
            >
              <path
                d="M10 9V15C10 16.1046 10.8954 17 12 17V17C13.1046 17 14 16.1046 14 15V7C14 4.79086 12.2091 3 10 3V3C7.79086 3 6 4.79086 6 7V15C6 18.3137 8.68629 21 12 21V21C15.3137 21 18 18.3137 18 15V8"
                stroke="currentColor"
              />
            </svg>

            <input
              type="text"
              placeholder="Ask anything"
              className="text-sm sm:text-[16px] w-full outline-none text-black dark:text-white dark:bg-[#0f0f0f] dark:placeholder-gray-400"
            />
            <div className="hidden sm:flex gap-1 sm:gap-2 items-center text-xs sm:text-sm hover:bg-gray-700/30 p-1.5 sm:p-2 rounded-2xl cursor-pointer shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className=""
              >
                <path
                  d="M6.5 12.5L11.5 17.5M6.5 12.5L11.8349 6.83172C13.5356 5.02464 15.9071 4 18.3887 4H20V5.61135C20 8.09292 18.9754 10.4644 17.1683 12.1651L11.5 17.5M6.5 12.5L2 11L5.12132 7.87868C5.68393 7.31607 6.44699 7 7.24264 7H11M11.5 17.5L13 22L16.1213 18.8787C16.6839 18.3161 17 17.553 17 16.7574V13"
                  stroke="currentColor"
                  strokeLinecap="square"
                ></path>
                <path
                  d="M4.5 16.5C4.5 16.5 4 18 4 20C6 20 7.5 19.5 7.5 19.5"
                  stroke="currentColor"
                ></path>
              </svg>
              Auto
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-secondary transition-transform duration-200"
                strokeWidth="2"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeLinecap="square"
                ></path>
              </svg>
            </div>
            <button className="flex items-center gap-2 shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="bg-black text-white dark:bg-white dark:text-black rounded-full border w-8 h-8 sm:w-10 sm:h-10 py-2 hover:bg-black/80 dark:hover:bg-white/80 cursor-pointer"
              >
                <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path>
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 w-full max-w-4xl">
            <div className="px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 border border-black/20 rounded-full hover:bg-gray-200/30 cursor-pointer text-xs sm:text-sm dark:border-white/20 dark:hover:bg-gray-800/20">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-secondary shrink-0"
                strokeWidth="2"
              >
                <path
                  d="M19.2987 8.84667C15.3929 1.86808 5.44409 5.76837 7.08971 11.9099C8.01826 15.3753 12.8142 14.8641 13.2764 12.8592C13.6241 11.3504 10.2964 12.3528 10.644 10.844C11.1063 8.839 15.9022 8.32774 16.8307 11.793C18.5527 18.2196 7.86594 22.4049 4.71987 15.2225"
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="stroke-black/10 dark:stroke-white/20 transition-[opacity,transform] duration-200 origin-center opacity-0 scale-0"
                ></path>
                <path
                  d="M2 13.8236C4.5 22.6927 18 21.3284 18 14.0536C18 9.94886 11.9426 9.0936 10.7153 11.1725C9.79198 12.737 14.208 12.6146 13.2847 14.1791C12.0574 16.2581 6 15.4029 6 11.2982C6 3.68585 20.5 2.2251 22 11.0945"
                  stroke="currentColor"
                  className="transition-transform duration-200 eas-out origin-center rotate-0"
                ></path>
              </svg>
              <span className="whitespace-nowrap">DeepSearch</span>
            </div>
            <div className="px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 border border-black/20 rounded-full hover:bg-gray-200/30 cursor-pointer text-xs sm:text-sm dark:border-white/20 dark:hover:bg-gray-800/20">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-secondary shrink-0"
                strokeWidth="2"
              >
                <path
                  d="M12 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V12"
                  stroke="currentColor"
                ></path>
                <path
                  d="M4 15.3333L8 12L16.4706 20"
                  stroke="currentColor"
                ></path>
                <circle cx="14" cy="10" r="1.75" fill="currentColor"></circle>
                <path
                  d="M21.0355 5.49989L18.5 5.49989M18.5 5.49989L15.9645 5.49989M18.5 5.49989L18.5 2.96436M18.5 5.49989L18.5 8.03542"
                  stroke="currentColor"
                  strokeLinecap="square"
                ></path>
              </svg>
              <span className="whitespace-nowrap">Create Image</span>
            </div>
            <div className="px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 border border-black/20 rounded-full hover:bg-gray-200/30 cursor-pointer text-xs sm:text-sm dark:border-white/20 dark:hover:bg-gray-800/20">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-secondary shrink-0"
                strokeWidth="2"
              >
                <path
                  d="M3.6665 15.6666V4.33331H7.99984L11.9998 6.33331H20.3332V15.6666C20.3332 17.8758 18.5423 19.6666 16.3332 19.6666H7.6665C5.45736 19.6666 3.6665 17.8758 3.6665 15.6666Z"
                  stroke="currentColor"
                ></path>
                <path d="M3 11H21" stroke="currentColor"></path>
              </svg>
              <span className="whitespace-nowrap">Pick Personas</span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-secondary transition-transform duration-200 shrink-0"
                strokeWidth="2"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeLinecap="square"
                ></path>
              </svg>
            </div>
            <div className="px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 border border-black/20 rounded-full hover:bg-gray-200/30 cursor-pointer text-xs sm:text-sm dark:border-white/20 dark:hover:bg-gray-800/20">
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
                className="lucide lucide-audio-lines text-secondary shrink-0"
              >
                <path d="M2 10v3"></path>
                <path d="M6 6v11"></path>
                <path d="M10 3v18"></path>
                <path d="M14 8v7"></path>
                <path d="M18 5v13"></path>
                <path d="M22 10v3"></path>
              </svg>
              <span className="whitespace-nowrap">Voice</span>
            </div>
          </div>

          {/* Footer Section */}
          <div className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-auto py-4 px-4 sm:px-6 max-w-2xl">
            By using PromptX and chatting with the AI assistant, you agree to
            our{" "}
            <a href="/terms" className="underline cursor-pointer">
              Terms
            </a>{" "}
            and acknowledge our{" "}
            <a href="/privacy" className="underline cursor-pointer">
              Privacy Policy
            </a>
            . You can manage your{" "}
            <a href="/cookies" className="underline cursor-pointer">
              Cookie Preferences
            </a>{" "}
            anytime.
          </div>
        </div>
      </div>
    </>
  );
}

export default Enhancer;
