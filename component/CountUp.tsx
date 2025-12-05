"use client";
import { useEffect, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
}

export default function CountUp({ end, duration = 1500, suffix = "" }: CountUpProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16.7);

    const animate = () => {
      start += increment;
      if (start < end) {
        setValue(start);
        requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };

    animate();
  }, [end, duration]);

  return <span>{value.toFixed(1)}{suffix}</span>;
}