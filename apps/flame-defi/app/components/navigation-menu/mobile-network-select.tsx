import { useCallback } from "react";

import { FlameNetwork } from "@repo/flame-types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components";
import { CheckMarkIcon } from "@repo/ui/icons";
import { FlameIcon } from "@repo/ui/icons/polychrome";
import { useConfig } from "config";

export const MobileNetworkSelect = () => {
  const { selectedFlameNetwork, selectFlameNetwork, networksList } =
    useConfig();

  const handleNetworkSelect = useCallback(
    (network: FlameNetwork) => {
      selectFlameNetwork(network);
    },
    [selectFlameNetwork],
  );

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value="transaction-details"
        className="text-grey-light text-sm border-b-0"
      >
        <div className="flex items-center justify-between w-full">
          <AccordionTrigger className="flex items-center gap-2">
            <FlameIcon />
            <span className="text-white text-base font-normal capitalize">
              {selectedFlameNetwork}
            </span>
          </AccordionTrigger>
        </div>
        <AccordionContent>
          {networksList.map((network) => (
            <div
              key={network}
              className="capitalize cursor-pointer mt-4"
              onClick={() => handleNetworkSelect(network)}
            >
              <div className="flex items-center justify-between text-white text-base">
                <div className="flex items-center gap-2">
                  <FlameIcon />
                  <span
                    className={`${selectedFlameNetwork === network ? "text-orange-soft" : "text-white"} text-base`}
                  >
                    {network}
                  </span>
                </div>
                {selectedFlameNetwork === network && (
                  <CheckMarkIcon className="text-orange-soft" />
                )}
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
