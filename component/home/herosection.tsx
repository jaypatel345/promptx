"use client";
import { useUi } from "@/context/UiContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function Herosection() {
  const { isNavOpen } = useUi();

  return (
    <div
      className={` mx-auto flex flex-col items-center gap-10 text-center px-4 mt-56  text-black bg-white dark:bg-black dark:text-white  transition-all  duration-300 max-w-5xl  ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0 "
      } `}
    >
      <div className="flex flex-col gap-10">
        <div className="font-medium text-sm sm:text-sm">
          prompt
          <span className=" bg-linear-to-r from-[#0070a0]  via-[#68d1fe] to-[#c4d5f3] bg-clip-text text-transparent">
            X
          </span>
        </div>

        <div className="text-3xl sm:text-5xl font-medium flex flex-wrap justify-center gap-y-0 px-2 md:gap-y-2">
          <span>Refine prompts. Spark creative AI ideas.</span>
          <span>Get dependable outputs.</span>
        </div>

        <div className="text-sm sm:text-base px-3">
          Now with advanced AI prompt enhancement technology generating clearer,
          more effective prompts for all users.
        </div>

        <div className="flex flex-row items-center justify-center gap-4">
          <Link href="/Enhancer">
            <button className="text-[13px] flex items-center gap-0.5 bg-black py-2 px-4 rounded-full text-white cursor-pointer hover:bg-black/85 dark:text-black dark:bg-white dark:hover:bg-white/95">
              Start Now
              <svg
                viewBox="0 0 1024 1024"
                className="w-3 h-4 text-white dark:text-black "
                xmlns="http://www.w3.org/2000/svg"
                fill="#000000"
              >
                <path
                  d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z"
                  fill="currentcolor "
                ></path>
              </svg>
            </button>
          </Link>

          <button className="text-[15px] flex items-center gap-2 hover:bg-gray-300/30 py-2 px-3 rounded-full cursor-pointer dark:hover:bg-gray-700/30">
            Learn about promptx
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M11.3349 10.3301V5.60547L4.47065 12.4707C4.21095 12.7304 3.78895 12.7304 3.52925 12.4707C3.26955 12.211 3.26955 11.789 3.52925 11.5293L10.3945 4.66504H5.66011C5.29284 4.66504 4.99507 4.36727 4.99507 4C4.99507 3.63273 5.29284 3.33496 5.66011 3.33496H11.9999C12.3672 3.33496 12.6649 3.63273 12.6649 4V10.3301C12.6649 10.6973 12.3672 10.9951 11.9999 10.9951C11.6327 10.9951 11.335 10.6973 11.3349 10.3301Z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Herosection;
