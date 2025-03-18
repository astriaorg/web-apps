import { FormatNumberOptions, useIntl } from "react-intl";
import { formatAbbreviatedNumber } from "../utils";

export const useFormatAbbreviatedNumber = () => {
  const { formatNumber } = useIntl();

  return {
    formatAbbreviatedNumber: (value: string, options: FormatNumberOptions) => {
      const { value: formattedValue, suffix } = formatAbbreviatedNumber(value);
      return formatNumber(+formattedValue, options) + suffix;
    },
  };
};
