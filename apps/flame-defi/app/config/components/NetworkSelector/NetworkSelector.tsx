"use client";

import type React from "react";
import { useCallback } from "react";
import type { FlameNetwork } from "../../chainConfigs";
import { useConfig } from "../../hooks/useConfig";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/shadcn-primitives";
import { FlameIcon } from "@repo/ui/icons";

export default function NetworkSelector(): React.ReactElement {
  const { selectedFlameNetwork, selectFlameNetwork, networksList } =
    useConfig();

  const handleNetworkSelect = useCallback(
    (network: FlameNetwork) => {
      selectFlameNetwork(network);
    },
    [selectFlameNetwork],
  );

  return (
    <Select
      defaultValue={selectedFlameNetwork}
      onValueChange={(value) => handleNetworkSelect(value as FlameNetwork)}
    >
      <SelectTrigger className="w-[140px] capitalize border-border hover:border-orange-soft rounded-md text-white transition text-base">
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
      <SelectContent className="bg-radial-dark">
        <SelectGroup>
          <SelectLabel className="text-white text-base">Networks</SelectLabel>
          {networksList.map((network) => (
            <SelectItem
              key={network}
              value={network}
              className="capitalize cursor-pointer data-[state=checked]:bg-white/5 data-[state=checked]:text-orange-soft [&:hover]:bg-white/5"
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
