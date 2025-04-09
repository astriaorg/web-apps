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
import { useConfig } from "config";
import { NetworkIcon } from "./network-icon";

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
          <span className="flex items-center gap-2">
            <NetworkIcon network={selectedFlameNetwork} size={16} />
            <span className="capitalize">{selectedFlameNetwork}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Network</SelectLabel>
          {networksList.map((network) => (
            <SelectItem key={network} value={network}>
              <span className="flex items-center gap-2">
                <NetworkIcon network={network} size={16} />
                <span className="capitalize">{network}</span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
