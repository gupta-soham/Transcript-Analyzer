import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
  showText = false,
}) => {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  return (
    <Link href="/" aria-label="Home">
      <div className={`flex items-center gap-2 ${className}`}>
        <div
          className={`flex items-center justify-center ${sizeClasses[size]}`}
        >
          <Image
            src="/logo.svg"
            alt="Transcript Analyzer Logo"
            width={
              size === "sm" ? 40 : size === "md" ? 48 : size === "lg" ? 56 : 80
            }
            height={
              size === "sm" ? 40 : size === "md" ? 48 : size === "lg" ? 56 : 80
            }
            className={`${sizeClasses[size]} object-contain filter dark:invert`}
          />
        </div>
        {showText && (
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Transcript Analyzer
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              AI-powered insights from your transcripts
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default Logo;
