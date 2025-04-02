"use client";

import type React from "react";
import { useCallback } from "react";

import { FlameNetwork } from "@repo/flame-types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components";
import { FlameIcon } from "@repo/ui/icons/polychrome";
import { useConfig } from "config";

export const NetworkSelect = (): React.ReactElement => {
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
      <SelectTrigger>
        <SelectValue>
          <div className="flex items-center gap-2">
            <FlameIcon size={16} />
            <span className="capitalize">{selectedFlameNetwork}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Network</SelectLabel>
          {networksList.map((network) => (
            <SelectItem
              key={network}
              value={network}
              className="data-[state=checked]:bg-semi-white"
            >
              <div className="flex items-center gap-2">
                <FlameIcon size={16} />
                <span className="capitalize">{network}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
