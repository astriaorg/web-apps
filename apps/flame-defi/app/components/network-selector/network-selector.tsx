"use client";

import type React from "react";
import { useCallback } from "react";

import { useConfig } from "config";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components";
import { FlameIcon } from "@repo/ui/icons";
import { FlameNetwork } from "@repo/flame-types";

export default function NetworkSelector(): React.ReactElement {
  const { selectedFlameNetwork, selectFlameNetwork, networksList } =
    useConfig();

  const handleNetworkSelect = useCallback(
    (network: FlameNetwork) => {
      selectFlameNetwork(network);
    },
    [selectFlameNetwork],
  );

  //NOTES: THING TO TRACK:
  // evmChainOptions
  // selectedEvmChain
  // selectedEvmNetwork

  return (
    <Select
      value={selectedFlameNetwork}
      onValueChange={(value) => handleNetworkSelect(value as FlameNetwork)}
    >
      <SelectTrigger className="w-[140px] capitalize border-border hover:border-orange-soft rounded-xl text-white transition text-base h-[40px]">
        <SelectValue
          placeholder={
            <div className="flex items-center gap-2 text-base">
              <FlameIcon size={16} />
              {selectedFlameNetwork}
            </div>
          }
        >
          <div className="flex items-center gap-2 text-base">
            <FlameIcon size={16} />
            {selectedFlameNetwork}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-radial-dark border-border">
        <SelectGroup>
          <SelectLabel className="text-white text-base">Networks</SelectLabel>
          {networksList.map((network) => (
            <SelectItem
              key={network}
              value={network}
              className="capitalize cursor-pointer data-[state=checked]:bg-semi-white data-[state=checked]:text-orange-soft [&:hover]:bg-semi-white"
            >
              <div className="flex items-center gap-1 text-white text-base">
                <FlameIcon size={16} />
                <span>{network}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
