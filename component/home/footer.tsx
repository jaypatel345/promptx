"use client";
import { useUi } from "@/context/UiContext";
import React from "react";

function Footer() {
  const { isNavOpen } = useUi();

  return (
    <footer
      className={`relative w-full lg:max-w-6xl mx-auto mt-40 px-4 sm:px-6 lg:px-0 transition-all duration-300 pb-20 text-sm text-gray-700 dark:bg-black dark:text-white  ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
      }`}
    >
      {/* Top fade line */}
      <div className="absolute top-0 left-0 w-full h-[1.5px] bg-linear-to-r from-transparent via-gray-300 to-transparent"></div>

      {/* Footer grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-10 pt-30 mb-64 ml-5 md:ml-20 ">
        <div>
          <h4 className="font-semibold mb-3 text-black dark:text-white ">Try PromptX On</h4>
          <ul className="space-y-2 text-gray-600 ">
            <li>Web</li>
            <li>iOS</li>
            <li>Android</li>
            <li>PromptX </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-black dark:text-white">Products</h4>
          <ul className="space-y-2 text-gray-600 ">
            <li>PromptX</li>
            <li>API</li>
            <li>PromptX Enterprise</li>
            <li>Promptpedia</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-black dark:text-white">Company</h4>
          <ul className="space-y-2 text-gray-600 ">
            <li>About</li>
            <li>Careers</li>
            <li>Contact</li>
            <li>News</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-black dark:text-white">Resources</h4>
          <ul className="space-y-2 text-gray-600 ">
            <li>Documentation</li>
            <li>Guides</li>
            <li>Support</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-black dark:text-white">Legal</h4>
          <ul className="space-y-2 text-gray-600 ">
            <li>Privacy Policy</li>
            <li>Security</li>
            <li>Safety</li>
            <li>Terms</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-black dark:text-white">Status</h4>
          <ul className="space-y-2 text-gray-600 ">
            <li>System Status</li>
            <li>Updates</li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className=" text-gray-500 text-xs text-center -mb-14">
        © {new Date().getFullYear()} PromptX. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;