import {
  CelestiaIcon,
  FlameIcon,
  MilkTiaIcon,
  NobleIcon,
  OsmosisIcon,
  StrideIcon,
  StrideTiaIcon,
  UsdcIcon,
  WrappedTiaIcon,
} from "@repo/ui/icons";
import type {
  CosmosChainInfo,
  CosmosChains,
  EvmChainInfo,
  EvmChains,
} from "@repo/flame-types";

const CelestiaChainInfo: CosmosChainInfo = {
  // Chain-id of the celestia chain.
  chainId: "celestia",
  // The name of the chain to be displayed to the user.
  chainName: "Celestia",
  // RPC endpoint of the chain
  rpc: "https://celestia-rpc.polkachu.com:443",
  // REST endpoint of the chain.
  rest: "https://celestia-api.polkachu.com",
  // Staking coin information
  stakeCurrency: {
    // Coin denomination to be displayed to the user.
    coinDenom: "TIA",
    // Actual denom (i.e. uatom, uscrt) used by the blockchain.
    coinMinimalDenom: "utia",
    // # of decimal points to convert minimal denomination to user-facing denomination.
    coinDecimals: 6,
    // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
    // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
    // coinGeckoId: ""
  },
  // (Optional) If you have a wallet webpage used to stake the coin then provide the url to the website in `walletUrlForStaking`.
  // The 'stake' button in Keplr extension will link to the webpage.
  // walletUrlForStaking: "",
  // The BIP44 path.
  bip44: {
    // You can only set the coin type of BIP44.
    // 'Purpose' is fixed to 44.
    coinType: 118,
  },
  // The address prefix of the chain.
  bech32Config: {
    bech32PrefixAccAddr: "celestia",
    bech32PrefixAccPub: "celestiapub",
    bech32PrefixConsAddr: "celestiavalcons",
    bech32PrefixConsPub: "celestiavalconspub",
    bech32PrefixValAddr: "celestiavaloper",
    bech32PrefixValPub: "celestiavaloperpub",
  },
  // List of all coin/tokens used in this chain.
  currencies: [
    {
      // Coin denomination to be displayed to the user.
      coinDenom: "TIA",
      // Actual denom (i.e. uatom, uscrt) used by the blockchain.
      coinMinimalDenom: "utia",
      // # of decimal points to convert minimal denomination to user-facing denomination.
      coinDecimals: 6,
      // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
      // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
      // coinGeckoId: ""
      ibcChannel: "channel-48",
      sequencerBridgeAccount: "astria13vptdafyttpmlwppt0s844efey2cpc0mevy92p",
      IconComponent: CelestiaIcon,
    },
  ],
  // List of coin/tokens used as a fee token in this chain.
  feeCurrencies: [
    {
      // Coin denomination to be displayed to the user.
      coinDenom: "TIA",
      // Actual denom (i.e. nria, uscrt) used by the blockchain.
      coinMinimalDenom: "utia",
      // # of decimal points to convert minimal denomination to user-facing denomination.
      coinDecimals: 6,
      // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
      // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
      // coinGeckoId: ""
      // (Optional) This is used to set the fee of the transaction.
      // If this field is not provided and suggesting chain is not natively integrated, Keplr extension will set the Keplr default gas price (low: 0.01, average: 0.025, high: 0.04).
      // Currently, Keplr doesn't support dynamic calculation of the gas prices based on on-chain data.
      // Make sure that the gas prices are higher than the minimum gas prices accepted by chain validators and RPC/REST endpoint.
      gasPriceStep: {
        low: 0.01,
        average: 0.02,
        high: 0.1,
      },
    },
  ],
  IconComponent: CelestiaIcon,
};

const NobleChainInfo: CosmosChainInfo = {
  chainId: "noble-1",
  chainName: "Noble",
  rpc: "https://noble-rpc.polkachu.com:443",
  rest: "https://noble-api.polkachu.com",
  stakeCurrency: {
    coinDenom: "USDC",
    coinMinimalDenom: "uusdc",
    coinDecimals: 6,
  },
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "noble",
    bech32PrefixAccPub: "noblepub",
    bech32PrefixConsAddr: "noblevalcons",
    bech32PrefixConsPub: "noblevalconspub",
    bech32PrefixValAddr: "noblevaloper",
    bech32PrefixValPub: "noblevaloperpub",
  },
  currencies: [
    {
      coinDenom: "USDC",
      coinMinimalDenom: "uusdc",
      coinDecimals: 6,
      ibcChannel: "channel-104",
      sequencerBridgeAccount:
        "astriacompat1eg8hhey0n4untdvqqdvlyl0e7zx8wfcaz3l6wu",
      IconComponent: UsdcIcon,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "USDC",
      coinMinimalDenom: "usdc",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.01,
        average: 0.02,
        high: 0.1,
      },
    },
  ],
  IconComponent: NobleIcon,
};

const OsmosisChainInfo: CosmosChainInfo = {
  chainId: "osmosis-1",
  chainName: "Osmosis",
  rpc: "https://osmosis-rpc.polkachu.com/",
  rest: "https://osmosis-api.polkachu.com/",
  stakeCurrency: {
    coinDenom: "milkTIA",
    coinMinimalDenom:
      "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
    coinDecimals: 6,
  },
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "osmosis",
    bech32PrefixAccPub: "osmosispub",
    bech32PrefixConsAddr: "osmosisvalcons",
    bech32PrefixConsPub: "osmosisvalconspub",
    bech32PrefixValAddr: "osmosisvaloper",
    bech32PrefixValPub: "osmosisvaloperpub",
  },
  currencies: [
    {
      coinDenom: "milkTIA",
      coinMinimalDenom:
        "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
      coinDecimals: 6,
      ibcChannel: "channel-85486",
      sequencerBridgeAccount: "astria1kgxhyhvynhcwwrylkzzx6q3a8rn3tuvasxvuy8",
      IconComponent: MilkTiaIcon,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "milkTIA",
      coinMinimalDenom:
        "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.01,
        average: 0.02,
        high: 0.1,
      },
    },
  ],
  IconComponent: OsmosisIcon,
};

const StrideChainInfo: CosmosChainInfo = {
  chainId: "stride-1",
  chainName: "Stride",
  rpc: "https://stride-rpc.polkachu.com",
  rest: "https://stride-api.polkachu.com/",
  stakeCurrency: {
    coinDenom: "stTIA",
    coinMinimalDenom: "stutia",
    coinDecimals: 6,
  },
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "stride",
    bech32PrefixAccPub: "stridepub",
    bech32PrefixConsAddr: "stridevalcons",
    bech32PrefixConsPub: "stridevalconspub",
    bech32PrefixValAddr: "stridevaloper",
    bech32PrefixValPub: "stridevaloperpub",
  },
  currencies: [
    {
      coinDenom: "stTIA",
      coinMinimalDenom: "stutia",
      coinDecimals: 6,
      ibcChannel: "channel-285",
      sequencerBridgeAccount: "astria1dllx9d9karss9ca8le25a4vqhf67a67d5d4l6r",
      IconComponent: StrideTiaIcon,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "stTIA",
      coinMinimalDenom: "stutia",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.01,
        average: 0.02,
        high: 0.1,
      },
    },
  ],
  IconComponent: StrideIcon,
};

export const cosmosChains: CosmosChains = {
  Celestia: CelestiaChainInfo,
  Noble: NobleChainInfo,
  Osmosis: OsmosisChainInfo,
  Stride: StrideChainInfo,
};

const FlameChainInfo: EvmChainInfo = {
  chainId: 253368190,
  chainName: "Flame",
  rpcUrls: ["https://rpc.flame.astria.org"],
  blockExplorerUrl: "https://explorer.flame.astria.org",
  contracts: {
    // from https://explorer.flame.astria.org/tx/0x4d1be5b490199ae1350d6ac47070def19eab35a7b1a08ba7d35244ad10c781fe
    wrappedCelestia: {
      address: "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071",
      blockCreated: 42997,
    },
    // from https://explorer.flame.astria.org/tx/0x50ee298330422d04f8502050e2e677141f9eb4e9baff6a2904537d9e29c8c10e
    swapRouter: {
      address: "0x29bBaFf21695fA41e446c4f37c07C699d9f08021",
      blockCreated: 43087,
    },
  },
  currencies: [
    {
      coinDenom: "TIA",
      title: "TIA",
      coinMinimalDenom: "utia",
      coinDecimals: 18,
      nativeTokenWithdrawerContractAddress:
        "0xB086557f9B5F6fAe5081CC5850BE94e62B1dDE57",
      ibcWithdrawalFeeWei: "10000000000000000",
      IconComponent: CelestiaIcon,
    },
    {
      coinDenom: "WTIA",
      title: "Wrapped Celestia",
      coinMinimalDenom: "wtia",
      coinDecimals: 18,
      erc20ContractAddress: "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071",
      ibcWithdrawalFeeWei: "10000000000000000",
      IconComponent: WrappedTiaIcon,
    },
    {
      coinDenom: "USDC",
      title: "USDC",
      coinMinimalDenom: "uusdc",
      coinDecimals: 6,
      erc20ContractAddress: "0x3f65144F387f6545bF4B19a1B39C94231E1c849F",
      ibcWithdrawalFeeWei: "10000000000000000",
      IconComponent: UsdcIcon,
    },
    {
      coinDenom: "milkTIA",
      title: "Milk TIA",
      coinMinimalDenom:
        "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
      coinDecimals: 18,
      erc20ContractAddress: "0xcbb93e854AA4EF5Db51c3b094F28952eF0dC67bE",
      ibcWithdrawalFeeWei: "10000000000000000",
      IconComponent: MilkTiaIcon,
    },
    {
      coinDenom: "stTIA",
      title: "Stride TIA",
      coinMinimalDenom: "stutia",
      coinDecimals: 18,
      erc20ContractAddress: "0xdf941D092b10FF07eAb44bD174dEe915c13FECcd",
      ibcWithdrawalFeeWei: "10000000000000000",
      IconComponent: StrideTiaIcon,
    },
  ],
  IconComponent: FlameIcon,
};

export const evmChains: EvmChains = {
  Flame: FlameChainInfo,
};
