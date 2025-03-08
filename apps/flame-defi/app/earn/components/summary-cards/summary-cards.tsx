import { AnimatedCounter, Card, CardLabel } from "@repo/ui/components";
import { FormatNumberOptions } from "react-intl";

export interface SummaryCardsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  items: {
    label: {
      left: React.ReactNode;
      right?: React.ReactNode;
    };
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
          padding="md"
          variant={it.variant}
          className="space-y-2"
        >
          <CardLabel>
            <span className="flex-1">{it.label.left}</span>
            <span>{it.label.right}</span>
          </CardLabel>
          <AnimatedCounter
            value={it.value}
            className="text-5xl/12 font-dot truncate"
            options={it.options}
            useAbbreviatedNumberFormat={it.useAbbreviatedNumberFormat}
          />
        </Card>
      ))}
    </div>
  );
};
