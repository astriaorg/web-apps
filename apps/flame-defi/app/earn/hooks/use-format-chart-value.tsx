import { useFormatAbbreviatedNumber } from "@repo/ui/hooks";
import { BigIntDataPoint, FloatDataPoint } from "earn/generated/gql/graphql";
import { useCallback } from "react";
import { useIntl } from "react-intl";

export const useFormatChartValue = () => {
  const { formatNumber } = useIntl();
  const { formatAbbreviatedNumber } = useFormatAbbreviatedNumber();

  const formatChartValue = useCallback(
    (
      value: Pick<BigIntDataPoint | FloatDataPoint, "y">,
      { style }: { style?: string },
    ) => {
      if (style === "percent") {
        return formatNumber(value.y ?? 0, {
          style,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }

      if (style === "currency") {
        return formatAbbreviatedNumber(value.y ?? 0, {
          style,
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }

      return formatAbbreviatedNumber(value.y ?? 0, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    [formatNumber, formatAbbreviatedNumber],
  );

  return {
    formatChartValue,
  };
};
