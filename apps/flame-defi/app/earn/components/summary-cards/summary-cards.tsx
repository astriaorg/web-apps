import {
  AnimatedCounter,
  Card,
  CardContent,
  CardLabel,
  Skeleton,
} from "@repo/ui/components";
import { FormatNumberOptions } from "react-intl";

export interface SummaryCardsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  items: {
    label: {
      left: React.ReactNode;
      right?: React.ReactNode;
    };
    footer?: React.ReactNode;
    value: number;
    variant?: React.ComponentPropsWithoutRef<typeof Card>["variant"];
    options?: FormatNumberOptions;
    useAbbreviatedNumberFormat?: boolean;
  }[];
}

export const SummaryCards = ({
  items,
  isLoading,
  ...props
}: SummaryCardsProps) => {
  return (
    <div {...props}>
      {items.map((it, index) => (
        <Card
          key={`summary-cards_item_${index}`}
          isLoading={isLoading}
          variant={it.variant}
          // Don't overflow the card on smaller screens after animation completes.
          className="overflow-hidden max-w-[calc(100vw - 32px)]"
        >
          <CardContent className="space-y-2">
            <CardLabel>
              <span className="flex-1">{it.label.left}</span>
              <span>{it.label.right}</span>
            </CardLabel>
            <Skeleton isLoading={isLoading}>
              <AnimatedCounter
                value={it.value}
                className="text-5xl/12 font-dot truncate"
                options={it.options}
                useAbbreviatedNumberFormat={it.useAbbreviatedNumberFormat}
              />
            </Skeleton>
            <CardLabel>
              <span className="text-xs text-typography-default truncate">
                {it.footer}
              </span>
            </CardLabel>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
