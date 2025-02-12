import { SearchIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/lib";
import { Input, Skeleton } from "@repo/ui/shadcn-primitives";
import { useTable } from "earn/hooks/useTable";
import { useRef, useState } from "react";

export const TableSearch = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState(false);

  const {
    search,
    setSearch,
    query: { data, isRefetching },
  } = useTable();

  return (
    <Skeleton
      isLoading={isRefetching && !data?.vaults.items?.length}
      className="w-full md:w-52"
    >
      <div className="w-full *:w-full">
        <Input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
              <SearchIcon aria-label="Search" size={24} />
            </div>
          }
          className={cn(
            "transition-all duration-300 ease-in-out",
            search ? "w-full md:w-52" : "w-0 border-transparent outline-none",
            "focus-visible:w-full md:focus-visible:w-52 focus-visible:border-orange-soft",
          )}
        />
      </div>
    </Skeleton>
  );
};
