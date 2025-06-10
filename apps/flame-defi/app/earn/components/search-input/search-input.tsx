import { useRef, useState } from "react";

import { Input } from "@repo/ui/components";
import { SearchIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";

export const SearchInput = ({
  className,
  value,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full *:w-full">
      <Input
        ref={inputRef}
        value={value}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        type="text"
        startAdornment={
          <div
            onClick={() => {
              if (inputRef.current && !isFocused) {
                setIsFocused(true);
                inputRef.current.focus();
              }
            }}
          >
            <SearchIcon aria-label="Search" size={20} />
          </div>
        }
        className={cn(
          "transition-all duration-300 ease-in-out",
          value
            ? "w-full md:w-52"
            : "w-0 border-transparent bg-transparent shadow-none",
          "focus-visible:w-full md:focus-visible:w-52",
          className,
        )}
        {...props}
      />
    </div>
  );
};
