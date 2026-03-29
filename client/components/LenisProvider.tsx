"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,             // scroll duration
      easing: (t) => 1 - Math.pow(2, -10 * t), // default easing
      wheelMultiplier: 1,        // smooth wheel
      touchMultiplier: 1.5,      // smooth touch scrolling
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}