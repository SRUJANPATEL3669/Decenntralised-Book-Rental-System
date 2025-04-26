import * as React from "react";
import { cn } from "../lib/utils";

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: { image: string; title: string; author: string }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return;
    // Duplicate the list for seamless scroll
    if (scrollerRef.current.children.length === items.length) {
      Array.from(scrollerRef.current.children).forEach((item) => {
        scrollerRef.current.appendChild(item.cloneNode(true));
      });
    }
    // Set direction and speed
    containerRef.current.style.setProperty("--animation-direction", direction === "left" ? "forwards" : "reverse");
    containerRef.current.style.setProperty("--animation-duration", speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s");
  }, [direction, speed, items.length]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative z-20 max-w-7xl overflow-hidden",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full gap-4 py-4 animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, i) => (
          <li
            className="w-[300px] max-w-full relative rounded-2xl border border-purple-700/30 bg-black/60 backdrop-blur-sm flex-shrink-0 px-4 py-6 group"
            key={i}
          >
            <div className="overflow-hidden rounded-lg mb-4 aspect-[3/4]">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-white font-bold text-lg line-clamp-1">{item.title}</h3>
            <p className="text-blue-200 text-sm">{item.author}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}