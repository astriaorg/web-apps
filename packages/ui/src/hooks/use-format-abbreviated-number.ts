import { FormatNumberOptions, useIntl } from "react-intl";

import {
  formatAbbreviatedNumber,
  type FormatAbbreviatedNumberOptions,
} from "../utils";

export const useFormatAbbreviatedNumber = () => {
  const { formatNumber } = useIntl();

  return {
    formatAbbreviatedNumber: (
      value: string,
      formatNumberOptions: FormatNumberOptions = {},
      formatAbbreviatedNumberOptions: FormatAbbreviatedNumberOptions = {},
    ) => {
      const { value: formattedValue, suffix } = formatAbbreviatedNumber(
        value,
        formatAbbreviatedNumberOptions,
      );
      return formatNumber(Number(formattedValue), formatNumberOptions) + suffix;
    },
  };
};
