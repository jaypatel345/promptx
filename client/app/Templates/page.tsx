import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white p-10 max-w-lg text-center rounded-3xl shadow-md border border-gray-100">
        <h1 className="text-3xl font-medium text-gray-800 mb-4">
          Oops... This Page Overslept
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          This page is still getting ready. Probably having a coffee, fixing its
          hair, or debugging itself emotionally. Check back soon once it decides
          to behave.
        </p>

        <p className="text-sm text-gray-400 mt-4">
          Meanwhile: refresh responsibly.
        </p>
      </div>
    </div>
  );
}
