import { Button, Card, CardFigureInput, CardLabel } from "@repo/ui/components";
import { FormattedNumber } from "@repo/ui/intl";
import { usePageContext } from "earn/modules/market-details/hooks/use-page-context";

export const BorrowCards = () => {
  const {
    query: { isPending },
  } = usePageContext();

  return (
    <div className="flex flex-col gap-2">
      <Card isLoading={isPending} padding="md" className="space-y-2">
        <CardFigureInput placeholder="0.00" />
        <CardLabel className="text-typography-light text-sm/3">
          <FormattedNumber
            value={0}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
            style="currency"
            currency="USD"
          />
        </CardLabel>
      </Card>
      <Button>Connect Wallet</Button>
    </div>
  );
};
