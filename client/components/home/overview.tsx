"use client";
import { useTheme } from "@/context/theme-context";
import { useUi } from "@/context/UiContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

function Overview() {
  const { isNavOpen, setIsNavOpen } = useUi();
  const { theme, setTheme } = useTheme();
  return (
    <>
      <div
        className={`mx-auto mt-64 md:max-w-5xl h-auto transition-all duration-300 max-w-sm  dark:bg-black dark:text-white bg-white
    relative 
    ${isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"}
  `}
      >
        {/* Gradient Top Border */}
       
          <div className="absolute top-0 left-0 w-full h-[1.5px] bg-linear-to-r from-transparent via-gray-300 to-transparent "></div>
           <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="  justify-center items-center pt-40 gap-5 md:flex pl-4 md:pl-0 overflow-y-hidden ">
            <div className="text-2xl md:text-4xl font-medium">
              Get perfectly optimized prompts with Prompt
              <span className="bg-linear-to-r from-[#0070a0]  via-[#68d1fe] to-[#f7f7f7] bg-clip-text text-transparent">
                X
              </span>
            </div>
            <div className="md:mt-0 mt-8 ">
              Unlock clearer, smarter, and more precise AI responses powered by
              advanced prompt enhancement technology.
            </div>
          </div>
        </motion.div>

        <div className="relative px-4 sm:px-0">
          <Image
            src={
              theme == "light"
                ? "/Screenshot 2025-11-29 at 12.31.41 AM.png"
                : "/Screenshot 2025-11-29 at 12.47.52 AM.png"
            }
            width={1200}
            height={700}
            alt=""
            className="mt-20 w-full h-auto border-x-2 border-t-4 rounded-t-3xl border-gray-500 dark:border-gray-300"
          />
        </div>

        {/* Second Image - Half Clipped with Fade */}
        <div className="absolute bottom-38.5 -right-70 w-1/3 md:w-full h-[400px] md:h-[400px] overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src={
                theme == "light"
                  ? "/Screenshot 2025-11-29 at 1.42.57 AM.png"
                  : "/Screenshot 2025-11-29 at 1.39.37 AM.png"
              }
              width={300}
              height={700}
              alt=""
              className="relative -right-1/3 md:-right-1/2 w-auto h-[300px] sm:h-[400px] md:h-[600px] object-contain border-x-2 border-t-4 rounded-t-3xl border-gray-500 dark:border-gray-300"
            />
            {/* Bottom fade effect */}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-black bg-white text-xs font-medium items-center justify-center mt-28 px-4  dark:text-white dark:bg-black">
          <Link href="/Enhancer">
            <button className="border text-[11px] md:text-[12px] border-gray-400 rounded-full px-4 py-3 flex justify-center items-center gap-1 hover:bg-black/85 cursor-pointer bg-black text-white whitespace-nowrap dark:text-black dark:bg-white dark:hover:bg-white/90">
              PROMPTX WEB{" "}
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
          </Link>
          <button className="border border-gray-400 text-[11px] md:text-[12px] rounded-full px-4 py-2 flex justify-center items-center gap-1 hover:bg-gray-200/80 cursor-pointer whitespace-nowrap dark:hover:bg-gray-700/40">
            IOS{" "}
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
          <button className="border border-gray-400 text-[11px] md:text-[12px] rounded-full px-4 py-2 flex justify-center items-center gap-1 hover:bg-gray-200/80 cursor-pointer whitespace-nowrap dark:hover:bg-gray-700/40">
            ANDROID{" "}
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
    </>
  );
}

export default Overview;
