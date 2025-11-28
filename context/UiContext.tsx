"use client"
import React, { createContext, useContext, useState } from "react";

// 1. Context MUST be outside
const UiContext = createContext<any>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  // 2. Accept children
  const [isNavOpen, setIsNavOpen] = useState(true);

  return (
    <UiContext.Provider value={{ isNavOpen, setIsNavOpen }}>
      {children}
    </UiContext.Provider>
  );
}

// 3. Custom hook must use the same context
export function useUi() {
  return useContext(UiContext);
}
