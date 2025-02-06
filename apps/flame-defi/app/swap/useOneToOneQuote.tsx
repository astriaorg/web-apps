import { useState, useMemo, useEffect } from 'react';
import { useGetQuote } from './useGetQuote';
import { GetQuoteResult, TokenState } from '@repo/ui/types';
import { formatDecimalValues } from 'utils/utils';
import { QUOTE_TYPE } from '../constants';

function useOneToOneQuote(inputOne?: TokenState, inputTwo?: TokenState) {
  const [flipDirection, setFlipDirection] = useState(true);
  const [quoteOne, setQuoteOne] = useState<GetQuoteResult | null>(null);
  const [quoteTwo, setQuoteTwo] = useState<GetQuoteResult | null>(null);

  const oneToOneValueTokens = useMemo(() => (
    flipDirection ? [inputOne, inputTwo] : [inputTwo, inputOne]
  ), [flipDirection, inputOne, inputTwo]);

  const { loading, error, getQuote } = useGetQuote();
  const tokenOneSymbol = oneToOneValueTokens[0]?.token?.coinDenom;
  const tokenTwoSymbol = oneToOneValueTokens[1]?.token?.coinDenom;
  const tokenTwoValue = flipDirection ? formatDecimalValues(quoteOne?.quoteDecimals, 6) : formatDecimalValues(quoteTwo?.quoteDecimals, 6);

  useEffect(() => {
    const fetchQuotes = async () => {
      const quote1 = await getQuote(
        QUOTE_TYPE.EXACT_IN,
        { token: inputOne?.token, value: "1" },
        { token: inputTwo?.token, value: "0" }
      );
      setQuoteOne({...quote1});

      const quote2 = await getQuote(
        QUOTE_TYPE.EXACT_IN,
        { token: inputTwo?.token, value: "1" },
        { token: inputOne?.token, value: "0" }
      );
      setQuoteTwo({...quote2});
    };

    fetchQuotes();
  }, [inputOne, inputTwo, getQuote]);

  return {
    tokenOneSymbol,
    tokenTwoSymbol,
    tokenTwoValue,
    oneToOneLoading: loading,
    error,
    setFlipDirection,
    flipDirection,
  };
}

export default useOneToOneQuote;
