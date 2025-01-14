"use client";

import { Dialog, DialogContent, DialogPortal, DialogTitle, DialogTrigger } from "../../shadcn-primitives"
import { useState } from "react";
import { ChevronDownIcon } from "@repo/ui/icons";
import { IconProps } from "../../types";

interface TokenItem {
  Icon: React.ComponentType<IconProps>;
  title: string;
  symbol: string;
}

interface TokenSelectorProps {
  tokens: TokenItem[];
  defaultTitle?: string;
  setSelectedToken: (token: TokenItem) => void;
  selectedToken?: TokenItem | null;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokens,
  defaultTitle = "Select token",
  selectedToken,
  setSelectedToken
}: TokenSelectorProps) => {
const [open, setOpen] = useState(false);

const handleSelectToken = (token: TokenItem) => {
  setOpen(false);
  setSelectedToken(token);
}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <div className="flex items-center bg-radial-dark px-1 rounded-2xl border border-solid border-border">
          {selectedToken?.Icon && <selectedToken.Icon size={20}/>}
              <h2 className="text-lg font-medium mx-2 whitespace-nowrap">
                {selectedToken?.symbol || defaultTitle}
              </h2>
              <ChevronDownIcon size={20}/>
            </div>  
        </DialogTrigger>
        <DialogPortal>
        <DialogContent className="bg-radial-dark w-[90%] md:w-[90%] lg:w-[480px]">
        <DialogTitle>Select a token</DialogTitle>
            <div>
                {tokens.map(({symbol, title, Icon}) => (
                    <div onClick={() => handleSelectToken({symbol, title, Icon})} key={symbol} className="flex items-center space-x-2 p-2 rounded-md hover:bg-grey-dark transition duration-300 cursor-pointer">
                        <Icon size={32} />
                        <div className="flex flex-col">
                            <span className="text-white text-md font-semibold">{title}</span>
                            <span className="text-grey-light text-sm">{symbol}</span>
                        </div>
                    </div>
                ))}
            </div>
        </DialogContent>
        </DialogPortal>
    </Dialog>
  );
};
