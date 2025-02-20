export interface OneToOneQuoteProps {
  tokenOneSymbol: string | undefined;
  tokenTwoSymbol: string | undefined;
  tokenTwoValue: string | undefined;
  oneToOneLoading: boolean;
  flipDirection: boolean;
  setFlipDirection: (flipDirection: boolean) => void;
}
