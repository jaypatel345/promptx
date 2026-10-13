"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Disable Lenis on app-like full-screen panes such as /enhancer
    if (pathname?.startsWith("/enhancer")) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,             // scroll duration
      easing: (t) => 1 - Math.pow(2, -10 * t), // default easing
      wheelMultiplier: 1,        // smooth wheel
      touchMultiplier: 1.5,      // smooth touch scrolling
      infinite: false,
    });

    let animationFrameId: number;

    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}