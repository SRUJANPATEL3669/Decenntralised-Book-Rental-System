"use client";
import { useEffect, useId, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export function SparklesCore({
  className,
  size = 1.2,
  minSize = null,
  density = 800,
  speed = 1.5,
  minSpeed = null,
  opacity = 1,
  direction = "",
  opacitySpeed = 3,
  minOpacity = null,
  color = "#ffffff",
  mousemove = false,
  hover = false,
  background = "transparent",
  options = {},
}: any) {
  const [init, setInit] = useState(false);
  const id = useId();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  if (!init) return null;

  return (
    <div className={className}>
      <Particles
        id={id}
        options={{
          background: { color: { value: background } },
          particles: {
            color: { value: color },
            number: { value: density, density: { enable: true, value_area: 800 } },
            size: { value: size, random: { enable: true, minimumValue: minSize || 0.5 } },
            move: { enable: true, speed, direction, straight: false, outModes: { default: "out" } },
            opacity: { value: opacity, random: { enable: true, minimumValue: minOpacity || 0.3 }, animation: { enable: true, speed: opacitySpeed } },
          },
          ...options,
        }}
      />
    </div>
  );
}