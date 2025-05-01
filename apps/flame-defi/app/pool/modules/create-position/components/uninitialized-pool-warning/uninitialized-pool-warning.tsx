import { Card, CardContent, CardDescription } from "@repo/ui/components";

export const UninitializedPoolWarning = () => {
  return (
    <Card variant="accent" className="bg-warning/20">
      <CardContent className="p-4">
        <CardDescription>
          This pool must be initialized before you can add liquidity. To
          initialize, enter a starting price for the pool. Then, enter your
          liquidity price range and deposit amount. Gas fees will be higher than
          usual due to the initialization transaction.
        </CardDescription>
      </CardContent>
    </Card>
  );
};
