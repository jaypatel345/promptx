"use client";
import React, { createContext, useContext, useState } from "react";

type UiContextType = {
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;

  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;

  openLogin: () => void;
  closeLogin: () => void;

  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const UiContext = createContext<UiContextType | undefined>(undefined);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  return (
    <UiContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isNavOpen,
        setIsNavOpen,
        isLoginOpen,
        setIsLoginOpen,
        openLogin,
        closeLogin,
      }}
    >
      {children}
    </UiContext.Provider>
  );
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}