import { AnimatedCounter, Card, CardLabel } from "@repo/ui/components";
import { FormatNumberOptions } from "@repo/ui/intl";

export interface SummaryCardsProps {
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

export const SummaryCards = ({ items, isLoading }: SummaryCardsProps) => {
  if (items.length !== 3) {
    throw new Error(
      "`SummaryCards` requires exactly 3 items. Adjust component to handle more items if needed.",
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-2">
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
