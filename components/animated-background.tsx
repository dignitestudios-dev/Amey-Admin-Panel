"use client";

import React from "react";

export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* Soft Ambient Light Glows */}
      <div className="animate-aurora-1 absolute -top-32 right-1/4 size-[480px] rounded-full bg-primary/10 blur-[130px] dark:bg-primary/12" />
      <div className="animate-aurora-2 absolute top-1/3 -left-28 size-[420px] rounded-full bg-primary/8 blur-[140px] dark:bg-primary/10" />
      <div className="animate-aurora-1 absolute -bottom-36 right-1/3 size-[440px] rounded-full bg-primary/6 blur-[130px] dark:bg-primary/8" />

      {/* EpicRides Grid Line Accent */}
      <div
        className="absolute inset-0 opacity-20 dark:opacity-25"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(var(--grid-line)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--grid-line)) 1px, transparent 1px)`,
          backgroundSize: "3.5rem 3.5rem",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, #000 65%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, #000 65%, transparent 100%)",
        }}
      />
    </div>
  );
}
