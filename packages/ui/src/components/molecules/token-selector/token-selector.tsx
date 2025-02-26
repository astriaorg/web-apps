"use client";

import { EvmCurrency } from "@repo/flame-types";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  CheckMarkIcon,
  ChevronDownIcon,
  CloseIcon,
  SearchIcon,
} from "../../../icons";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  Input,
} from "../../../shadcn-primitives";

interface TokenSelectorProps {
  tokens: EvmCurrency[] | undefined;
  defaultTitle?: string;
  setSelectedToken: (token: EvmCurrency) => void;
  selectedToken?: EvmCurrency | null;
  unavailableToken?: EvmCurrency | null;
  CustomTokenButton?: (props: {
    selectedToken?: EvmCurrency | null;
    defaultTitle: string;
  }) => React.ReactElement;
}

export const TokenSelector = ({
  tokens,
  defaultTitle = "Select token",
  selectedToken,
  setSelectedToken,
  unavailableToken,
  CustomTokenButton,
}: TokenSelectorProps): React.ReactElement => {
  const [open, setOpen] = useState(false);
  const [filteredTokens, setFilteredTokens] = useState(tokens);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectToken = (token: EvmCurrency) => {
    if (
      token.coinDenom !== selectedToken?.coinDenom &&
      unavailableToken?.coinDenom !== token.coinDenom
    ) {
      setOpen(false);
      setSelectedToken(token);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    const filteredTokens = tokens?.filter(
      (token) =>
        token.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
        token?.coinDenom?.toLowerCase().includes(e.target.value.toLowerCase()),
    );

    setFilteredTokens(filteredTokens);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {CustomTokenButton ? (
        <CustomTokenButton
          selectedToken={selectedToken}
          defaultTitle="Select token"
        />
      ) : (
        <DialogTrigger>
          <div
            className={`flex items-center bg-radial-dark px-1 rounded-2xl border border-solid border-border`}
          >
            {selectedToken?.IconComponent && (
              <selectedToken.IconComponent size={20} />
            )}
            <h2 className="text-lg font-medium mx-2 whitespace-nowrap">
              {selectedToken?.coinDenom || defaultTitle}
            </h2>
            <ChevronDownIcon size={20} />
          </div>
        </DialogTrigger>
      )}
      <DialogPortal>
        <DialogContent className="bg-radial-dark w-[90%] md:w-[90%] lg:w-[450px] [&>button]:hidden fixed top-[440px] left-[50%] -translate-x-[50%] transition rounded-xl">
          <div className="flex items-center justify-between">
            <DialogTitle>Select a token</DialogTitle>
            <button onClick={() => setOpen(false)}>
              <CloseIcon className="text-grey-light hover:text-white transition" />
            </button>
          </div>
          <Input
            placeholder="Search"
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full border border-border focus:border-orange-soft rounded-xl"
            startAdornment={<SearchIcon size={16} />}
          />
          <div className="h-[380px]">
            {filteredTokens?.map((token) => {
              const { coinDenom, title, IconComponent } = token;
              const isUnavailableOrSelected =
                unavailableToken?.coinDenom === coinDenom ||
                selectedToken?.coinDenom === coinDenom;
              const baseClasses =
                "flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-semi-white transition cursor-pointer";
              const conditionalClasses = isUnavailableOrSelected
                ? "cursor-not-allowed"
                : "";

              return (
                <div
                  onClick={() => handleSelectToken(token)}
                  key={coinDenom}
                  className={twMerge(baseClasses, conditionalClasses)}
                  style={{ position: "relative" }}
                >
                  {isUnavailableOrSelected && (
                    <div className="absolute inset-0 bg-black opacity-40 z-10 cursor-not-allowed rounded-md"></div>
                  )}
                  <div className="flex items-center relative z-1">
                    {IconComponent && (
                      <IconComponent size={32} className="mr-3" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-white text-md font-semibold">
                        {title}
                      </span>
                      <span className="text-grey-light text-sm">
                        {coinDenom}
                      </span>
                    </div>
                  </div>
                  {selectedToken?.coinDenom === coinDenom && (
                    <CheckMarkIcon className="text-orange-soft relative z-1" />
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
