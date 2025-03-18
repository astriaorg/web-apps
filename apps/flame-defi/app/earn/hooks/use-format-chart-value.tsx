import { formatAbbreviatedNumber } from "@repo/ui/utils";
import { BigIntDataPoint, FloatDataPoint } from "earn/generated/gql/graphql";
import { useCallback } from "react";
import { useIntl } from "react-intl";

export const useFormatChartValue = () => {
  const { formatNumber } = useIntl();

  const formatChartValue = useCallback(
    (
      value: Pick<BigIntDataPoint | FloatDataPoint, "y">,
      { style }: { style?: string },
    ) => {
      if (style === "percent") {
        return formatNumber(value.y ?? 0, {
          style,
          minimumFractionDigits: 2,
        });
      }

      const { value: totalSupply, suffix } = formatAbbreviatedNumber(
        value.y ?? 0,
      );

      if (style === "currency") {
        return (
          formatNumber(+totalSupply, {
            style,
            currency: "USD",
            minimumFractionDigits: 2,
          }) + suffix
        );
      }

      return (
        formatNumber(+totalSupply, {
          minimumFractionDigits: 2,
        }) + suffix
      );
    },
    [formatNumber],
  );

  return {
    formatChartValue,
  };
};
