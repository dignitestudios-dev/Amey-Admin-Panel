import * as React from "react";
import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  props?: React.ComponentProps<typeof Image>;
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <Image
      alt="Amey Admin"
      src="/images/logo.webp"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
}
