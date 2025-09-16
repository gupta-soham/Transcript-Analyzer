"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export function CopyButton({
  text,
  label = "text",
  className,
  size = "sm",
  variant = "ghost",
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success(`${label} copied to clipboard`);

      // Reset to copy icon after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
      console.error("Copy failed:", error);
    }
  }, [text, label]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        "transition-all duration-200 hover:scale-105",
        isCopied && "text-green-600 hover:text-green-700",
        className
      )}
      aria-label={`Copy ${label} to clipboard`}
    >
      {isCopied ? (
        <Check className="h-4 w-4 animate-in zoom-in-50 duration-300" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
