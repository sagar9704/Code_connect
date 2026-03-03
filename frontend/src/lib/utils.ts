// src/lib/utils.ts
import { clsx } from "clsx";
import { tv } from "tailwind-merge"; // optional if you want variant merging

export function cn(...args: any[]) {
  return clsx(args);
}
