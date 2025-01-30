export interface IconProps {
  className?: string;
  size?: number;
}

export type EvmCurrency = {
  title: string;
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  // contract address if this is a ERC20 token
  erc20ContractAddress?: `0x${string}`;
  // contract address if this a native token
  nativeTokenWithdrawerContractAddress?: `0x${string}`;
  // fee needed to pay for the ibc withdrawal, 18 decimals
  ibcWithdrawalFeeWei: string;
  IconComponent?: React.FC<IconProps>;
};

export interface TokenState {
  token?: EvmCurrency | null;
  value: string;
}

export interface EvmChainInfo {
  chainId: number;
  chainName: string;
  currencies: [EvmCurrency, ...EvmCurrency[]];
  rpcUrls: string[];
  IconComponent?: React.FC<IconProps>;
  blockExplorerUrl?: string;
}
