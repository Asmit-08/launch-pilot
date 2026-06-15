"use client";

import { useEffect, useState } from "react";

export default function Typewriter() {
  const text = "Pilot";

  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      setDisplayed(text.slice(0, index + 1));

      index++;

      if (index === text.length) {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-blue-500">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}