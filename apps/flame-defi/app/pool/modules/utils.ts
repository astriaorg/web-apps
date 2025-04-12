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

export const handleInputChange = (
  value: string,
  id: POOL_INPUT_ID,
  setErrorText: (errorText: string | null) => void,
  setInput0: (input0: string) => void,
  setInput1: (input1: string) => void,
  currentPrice: string,
  coinDecimals?: number,
) => {
  if (!coinDecimals) return;
  setErrorText(null);
  if (id === POOL_INPUT_ID.INPUT_ZERO) {
    setInput0(value);
    setInput1(
      getTokenCalculatedTokenValue(value, id, coinDecimals, currentPrice),
    );
  } else {
    setInput1(value);
    setInput0(
      getTokenCalculatedTokenValue(value, id, coinDecimals, currentPrice),
    );
  }
};
