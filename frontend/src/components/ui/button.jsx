// src/components/ui/button.tsx
import React from "react";
import { cn } from "@/lib/utils";

export const Button = ({ children, className = "", ...props }: any) => {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold shadow-sm",
        "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white",
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
