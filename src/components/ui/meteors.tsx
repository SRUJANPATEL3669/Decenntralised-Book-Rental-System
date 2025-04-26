import React from "react";
import { cn } from "@/lib/utils";

export function Meteors({ number = 20, className }: { number?: number; className?: string }) {
  const meteors = new Array(number).fill(true);
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {meteors.map((_, idx) => {
        const duration = Math.floor(Math.random() * 10) + 5;
        const size = Math.floor(Math.random() * 4) + 1;
        return (
          <span
            key={"meteor" + idx}
            className="absolute top-0 left-0 w-0.5 h-0.5 rounded-full bg-white block transform rotate-[215deg] opacity-0 animate-meteor"
            style={{
              top: Math.floor(Math.random() * 100) + "%",
              left: Math.floor(Math.random() * 100) + "%",
              animationDelay: Math.random() * (number * 0.5) + "s",
              animationDuration: duration + "s",
              width: size + "px",
              height: size * 30 + "px",
            }}
          />
        );
      })}
    </div>
  );
}