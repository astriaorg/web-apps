import { Card, CardContent, CardFigureInput } from "@repo/ui/components";

export interface TokenAmountInputProps {
  value: string;
  onInput: ({ value }: { value: string }) => void;
}

export const TokenAmountInput = ({
  value,
  onInput,
  children,
}: TokenAmountInputProps & React.PropsWithChildren) => {
  return (
    <Card variant="secondary">
      <CardContent className="flex items-center justify-between gap-6">
        <CardFigureInput
          value={value}
          onInput={(event) =>
            onInput({
              value: event.currentTarget.value,
            })
          }
        />
        {children}
      </CardContent>
    </Card>
  );
};
