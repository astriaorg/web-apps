import { POOL_INPUT_ID } from "pool/types";

export const getTokenCalculatedTokenValue = (
  value: string,
  sourceId: POOL_INPUT_ID,
  coinDecimals: number,
  currentPrice: string,
) => {
  if (!value || isNaN(Number(value)) || !currentPrice) return "";
  const numericValue = parseFloat(value);
  const numericPrice = parseFloat(currentPrice);

  const tokenValue =
    sourceId === POOL_INPUT_ID.INPUT_ZERO
      ? numericValue * numericPrice
      : numericValue / numericPrice;

  return tokenValue.toFixed(coinDecimals);
};
