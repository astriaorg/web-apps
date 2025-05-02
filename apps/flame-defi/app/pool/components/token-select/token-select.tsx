import { useCallback, useEffect, useState } from "react";

import type { EvmCurrency } from "@repo/flame-types";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  TokenIcon,
} from "@repo/ui/components";
import { CheckIcon, ChevronDownSmallIcon, SearchIcon } from "@repo/ui/icons";

interface TokenSelectProps {
  value?: EvmCurrency;
  onValueChange: (value: EvmCurrency) => void;
  options: EvmCurrency[];
}

export const TokenSelect = ({
  value,
  options,
  onValueChange,
}: TokenSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  const handleSearch = useCallback<React.FormEventHandler<HTMLInputElement>>(
    (event) => {
      const value = event.currentTarget.value;

      setSearch(value);

      const filteredOptions = options.filter(
        (it) =>
          it.title.toLowerCase().includes(value.toLowerCase()) ||
          it.coinDenom.toLowerCase().includes(value.toLowerCase()) ||
          it.erc20ContractAddress?.toLowerCase().includes(value.toLowerCase()),
      );

      setFilteredOptions(filteredOptions);
    },
    [options],
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="h-auto p-2 hover:bg-initial">
          <div className="flex items-center gap-2">
            {value && <TokenIcon size={16} symbol={value.coinDenom} />}
            <span className="text-sm font-medium whitespace-nowrap">
              {value?.coinDenom ?? "Select Token"}
            </span>
            <ChevronDownSmallIcon size={16} />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="top-auto bottom-0 translate-y-0 rounded-b-none border-b-transparent md:top-[50%] md:-translate-y-1/2 md:rounded-b-xl md:border-b-stroke-default flex flex-col h-min">
        <DialogHeader>
          <DialogTitle className="text-left">Select a Token</DialogTitle>
          <DialogDescription className="sr-only"></DialogDescription>
        </DialogHeader>
        <Input
          value={search}
          onInput={handleSearch}
          placeholder="Search name or paste address..."
          startAdornment={
            <SearchIcon
              aria-label="Search"
              size={20}
              className="text-icon-subdued"
            />
          }
          className="bg-transparent"
        />
        <div className="flex flex-col gap-1">
          {filteredOptions.map((option) => (
            <Button
              key={option.coinDenom}
              variant="secondary"
              className="w-full h-auto py-2 justify-start bg-transparent disabled:opacity-100"
              disabled={
                !!value &&
                option.erc20ContractAddress === value.erc20ContractAddress
              }
              onClick={() => {
                onValueChange(option);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-2 flex-1 [&_svg]:size-8">
                <TokenIcon size={32} symbol={option.coinDenom} />
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-sm font-medium">
                    {option.coinDenom}
                  </span>
                  {/* TODO: Add token name. */}
                  {/* <span className="text-xs font-medium text-typography-subdued">
                    {option.coinDenom}
                  </span> */}
                </div>
              </div>
              <div>
                {!!value &&
                  option.erc20ContractAddress ===
                    value?.erc20ContractAddress && (
                    <CheckIcon size={16} className="text-icon-subdued" />
                  )}
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
