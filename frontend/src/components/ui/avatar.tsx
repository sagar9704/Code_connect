// src/components/ui/avatar.tsx
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & { src?: string, alt?: string }
>(({ src, alt = "avatar", className, ...props }, ref) => {
  return (
    <AvatarPrimitive.Root ref={ref} {...props} className={cn("inline-flex items-center justify-center overflow-hidden rounded-full", className)}>
      <AvatarPrimitive.Image src={src} alt={alt} className="w-10 h-10 object-cover" />
      <AvatarPrimitive.Fallback className="w-10 h-10 flex items-center justify-center bg-slate-700 text-white font-bold">
        {alt?.[0]?.toUpperCase() ?? "U"}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
});
Avatar.displayName = "Avatar";
export default Avatar;
