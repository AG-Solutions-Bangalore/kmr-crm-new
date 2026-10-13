import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  allowSlash?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, allowSlash = false, onChange, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!allowSlash && type !== "password" && type !== "file" && e.key === "/") {
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart ?? target.value.length;
        const end = target.selectionEnd ?? target.value.length;
        const nextVal =
          target.value.substring(0, start) + "-" + target.value.substring(end);

        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        if (nativeSetter) {
          nativeSetter.call(target, nextVal);
        } else {
          target.value = nextVal;
        }
        target.dispatchEvent(new Event("input", { bubbles: true }));
        requestAnimationFrame(() => {
          target.setSelectionRange(start + 1, start + 1);
        });
        return;
      }
      onKeyDown?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!allowSlash && type !== "password" && type !== "file") {
        if (e.target.value.includes("/")) {
          e.target.value = e.target.value.replace(/\//g, "-");
        }
      }
      onChange?.(e);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[var(--placeholder,#9ca3af)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
