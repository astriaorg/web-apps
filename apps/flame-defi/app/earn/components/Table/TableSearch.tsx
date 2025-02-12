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
      className="w-[200px]"
    >
      <Input
        ref={inputRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        type="text"
        endAdornment={
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              !search && !isFocused && "-ml-10",
            )}
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
          search ? "w-[200px]" : "w-0 border-transparent outline-none",
          "focus-visible:w-[200px] focus-visible:border-orange-soft",
        )}
      />
    </Skeleton>
  );
};
