import type { EvmCurrency } from "@repo/flame-types";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  TokenIcon,
} from "@repo/ui/components";
import { CheckIcon, ChevronDownSmallIcon } from "@repo/ui/icons";
import { useState } from "react";

interface TokenSelectProps {
  value?: EvmCurrency;
  onValueChange: (value: EvmCurrency) => void;
  options: EvmCurrency[];
}

// TODO: Add filter.
export const TokenSelect = ({
  value,
  options,
  onValueChange,
}: TokenSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
      <DialogContent className="bottom-0 translate-y-0 rounded-b-none border-b-transparent md:-translate-y-1/2 md:rounded-b-xl md:border-b-stroke-default">
        <DialogHeader>
          <DialogTitle className="text-left">Select a Token</DialogTitle>
          <DialogDescription className="sr-only"></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          {options.map((option) => (
            <Button
              key={option.coinDenom}
              variant="secondary"
              className="w-full h-auto py-2 justify-start bg-transparent disabled:opacity-100"
              disabled={
                option.erc20ContractAddress === value?.erc20ContractAddress
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
