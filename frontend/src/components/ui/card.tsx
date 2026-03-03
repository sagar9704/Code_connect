// src/components/ui/card.tsx
import React from "react";
import { cn } from "@/lib/utils";
export const Card = ({ children, className = "" }: any) => (
  <div className={cn("bg-gradient-to-b from-[#071018] to-[#07121a] p-4 rounded-xl border border-white/6", className)}>
    {children}
  </div>
);
export default Card;
