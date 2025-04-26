import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function LampContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(0.3);
  };

  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative", className)}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full z-0" aria-hidden="true">
        <defs>
          <radialGradient
            id="lamp"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform={translate(${position.x} ${position.y}) scale(300)}
          >
            <stop stopColor="white" />
            <stop stopColor="white" offset=".4" />
            <stop stopColor="white" stopOpacity="0" offset="1" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#lamp)" style={{ opacity }} />
      </svg>
      {children}
    </div>
  );
}