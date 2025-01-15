import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/shadcn-primitives";
import { InfoTooltip } from "@repo/ui/components";
import { GasIcon } from "@repo/ui/icons";

interface TxnInfoProps {}

export const TxnInfo = ({}: TxnInfoProps) => {
  // TODO: get the real calculated data
  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="transaction-details"
        className="text-grey-light text-sm border-b-0"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">1 TIA = 4.645 USDC</div>
          <AccordionTrigger>
            <div className="[&>svg]:!transform-none">
              <GasIcon size={20} />
            </div>
          </AccordionTrigger>
        </div>
        <AccordionContent>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="text-grey-light flex items-center gap-1">
                Fee (0.25%){" "}
                <InfoTooltip content="Info about fees here" side="right" />
              </span>
              <span className="text-grey-light">$8.15</span>
            </p>
            <p className="flex justify-between">
              <span className="text-grey-light flex items-center gap-1">
                Network cost{" "}
                <InfoTooltip
                  content="Info about networks cost here"
                  side="right"
                />
              </span>
              <span className="text-grey-light">$7.23</span>
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
