import {
  AstriaChain,
  AstriaChains,
  ChainType,
  CoinbaseChains,
  CosmosChainInfo,
  CosmosChains,
  EvmChainInfo,
  EvmCurrency,
  IbcCurrency,
} from "@repo/flame-types";
import {
  AstriaIcon,
  BaseIcon,
  CelestiaIcon,
  DropTiaIcon,
  MilkTiaIcon,
  NeutronIcon,
  NobleIcon,
  OsmosisIcon,
  StrideIcon,
  StrideTiaIcon,
  UsdcIcon,
  WrappedTiaIcon,
} from "@repo/ui/icons/polychrome";

const CelestiaChainInfo: CosmosChainInfo = {
  chainType: ChainType.COSMOS,
  chainId: "celestia",
  chainName: "Celestia",
  rpc: "https://celestia-rpc.polkachu.com:443",
  rest: "https://celestia-api.polkachu.com",
  stakeCurrency: {
    coinDenom: "TIA",
    coinMinimalDenom: "utia",
    coinDecimals: 6,
    coinGeckoId: "celestia",
  },
  // The BIP44 path.
  bip44: {
    // You can only set the coin type of BIP44.
    // 'Purpose' is fixed to 44.
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "celestia",
    bech32PrefixAccPub: "celestiapub",
    bech32PrefixConsAddr: "celestiavalcons",
    bech32PrefixConsPub: "celestiavalconspub",
    bech32PrefixValAddr: "celestiavaloper",
    bech32PrefixValPub: "celestiavaloperpub",
  },
  currencies: [
    new IbcCurrency({
      chainId: "celestia",
      coinDecimals: 6,
      coinDenom: "TIA",
      coinGeckoId: "celestia",
      coinMinimalDenom: "utia",
      ibcChannel: "channel-48",
      IconComponent: CelestiaIcon,
      isBridgeable: true,
      isNative: true,
      sequencerBridgeAccount: "astria13vptdafyttpmlwppt0s844efey2cpc0mevy92p",
      title: "TIA",
    }),
  ],
  feeCurrencies: [
    {
      coinDenom: "TIA",
      coinMinimalDenom: "utia",
      coinDecimals: 6,
      coinGeckoId: "celestia",
      gasPriceStep: {
        low: 0.01,
        average: 0.02,
        high: 0.1,
      },
    },
  ],
  IconComponent: CelestiaIcon,
};

const NeutronChainInfo: CosmosChainInfo = {
  chainType: ChainType.COSMOS,
  chainId: "neutron-1",
  chainName: "Neutron",
  // RPC endpoint of the chain
  rpc: "wss://neutron-rpc.publicnode.com:443",
  // REST endpoint of the chain.
  rest: "https://neutron-rest.publicnode.com",
  // Staking coin information
  stakeCurrency: {
    // Coin denomination to be displayed to the user.
    coinDenom: "dTIA",
    // Actual denom (i.e. uatom, uscrt) used by the blockchain.
    coinMinimalDenom:
      "factory/neutron1ut4c6pv4u6vyu97yw48y8g7mle0cat54848v6m97k977022lzxtsaqsgmq/udtia",
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
    bech32PrefixAccAddr: "neutron",
    bech32PrefixAccPub: "neutronpub",
    bech32PrefixConsAddr: "neutronvalcons",
    bech32PrefixConsPub: "neutronvalconspub",
    bech32PrefixValAddr: "neutronvaloper",
    bech32PrefixValPub: "neutronvaloperpub",
  },
  // List of all coin/tokens used in this chain.
  currencies: [
    new IbcCurrency({
      chainId: "neutron-1",
      coinDenom: "dTIA",
      coinMinimalDenom:
        "factory/neutron1ut4c6pv4u6vyu97yw48y8g7mle0cat54848v6m97k977022lzxtsaqsgmq/udtia",
      coinDecimals: 6,
      isBridgeable: true,
      isNative: true,
      ibcChannel: "channel-6236",
      sequencerBridgeAccount: "astria15juwcclg07xs38757q257evltequawcejzzs4l",
      title: "dTIA",
      IconComponent: DropTiaIcon,
    }),
  ],
  // List of coin/tokens used as a fee token in this chain.
  feeCurrencies: [
    {
      // Coin denomination to be displayed to the user.
      coinDenom: "dTIA",
      // Actual denom (i.e. nria, uscrt) used by the blockchain.
      coinMinimalDenom:
        "factory/neutron1ut4c6pv4u6vyu97yw48y8g7mle0cat54848v6m97k977022lzxtsaqsgmq/udtia",
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
  IconComponent: NeutronIcon,
};

const NobleChainInfo: CosmosChainInfo = {
  chainType: ChainType.COSMOS,
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
    new IbcCurrency({
      chainId: "noble-1",
      coinDenom: "USDC",
      coinMinimalDenom: "uusdc",
      coinDecimals: 6,
      isBridgeable: true,
      isNative: true,
      ibcChannel: "channel-104",
      sequencerBridgeAccount:
        "astriacompat1eg8hhey0n4untdvqqdvlyl0e7zx8wfcaz3l6wu",
      title: "USDC",
      IconComponent: UsdcIcon,
    }),
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
  chainType: ChainType.COSMOS,
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
    new IbcCurrency({
      chainId: "osmosis-1",
      coinDenom: "milkTIA",
      coinMinimalDenom:
        "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
      coinDecimals: 6,
      isBridgeable: true,
      isNative: true,
      ibcChannel: "channel-85486",
      sequencerBridgeAccount: "astria1kgxhyhvynhcwwrylkzzx6q3a8rn3tuvasxvuy8",
      title: "milkTIA",
      IconComponent: MilkTiaIcon,
    }),
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
  chainType: ChainType.COSMOS,
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
    new IbcCurrency({
      chainId: "stride-1",
      coinDenom: "stTIA",
      coinMinimalDenom: "stutia",
      coinDecimals: 6,
      isBridgeable: true,
      isNative: true,
      ibcChannel: "channel-285",
      sequencerBridgeAccount: "astria1dllx9d9karss9ca8le25a4vqhf67a67d5d4l6r",
      title: "stTIA",
      IconComponent: StrideTiaIcon,
    }),
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
  Neutron: NeutronChainInfo,
  Noble: NobleChainInfo,
  Osmosis: OsmosisChainInfo,
  Stride: StrideChainInfo,
};

const WRAPPED_NATIVE_TOKEN = new EvmCurrency({
  chainId: 253368190,
  coinDenom: "WTIA",
  title: "Wrapped Celestia",
  coinMinimalDenom: "wtia",
  coinDecimals: 18,
  erc20ContractAddress: "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071",
  wrapped: null,
  isNative: false,
  isWrappedNative: true,
  ibcWithdrawalFeeWei: "0",
  isBridgeable: true,
  IconComponent: WrappedTiaIcon,
});

const AstriaChainInfo: AstriaChain = {
  chainType: ChainType.ASTRIA,
  chainId: 253368190,
  chainName: "Flame",
  rpcUrls: ["https://rpc.flame.astria.org"],
  blockExplorerUrl: "https://explorer.flame.astria.org",
  contracts: {
    // from https://explorer.flame.astria.org/tx/0x4d1be5b490199ae1350d6ac47070def19eab35a7b1a08ba7d35244ad10c781fe
    wrappedNativeToken: {
      address: "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071",
    },
    // from https://explorer.flame.astria.org/tx/0x50ee298330422d04f8502050e2e677141f9eb4e9baff6a2904537d9e29c8c10e
    swapRouter: {
      address: "0x29bBaFf21695fA41e446c4f37c07C699d9f08021",
    },
    // from https://explorer.flame.astria.org/address/0xE1EE203f374EE6CA6B72420844796c7acDf16A8b?tab=contract
    poolFactory: {
      address: "0xE1EE203f374EE6CA6B72420844796c7acDf16A8b",
    },
    // from https://explorer.flame.astria.org/address/0x0aDe7a8790D8537C620001F4A0DCb5CCF404a684?tab=contract
    poolContract: {
      address: "0x0aDe7a8790D8537C620001F4A0DCb5CCF404a684",
    },
    // from https://explorer.flame.astria.org/token/0x1dAfd262A228571125f36f1a1333389dB0444edA?tab=contract
    nonfungiblePositionManager: {
      address: "0x1dAfd262A228571125f36f1a1333389dB0444edA",
    },
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    },
  },
  currencies: [
    new EvmCurrency({
      chainId: 253368190,
      coinDenom: "TIA",
      title: "TIA",
      coinMinimalDenom: "utia",
      coinDecimals: 18,
      nativeTokenWithdrawerContractAddress:
        "0xB086557f9B5F6fAe5081CC5850BE94e62B1dDE57",
      wrapped: WRAPPED_NATIVE_TOKEN,
      isNative: true,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "0",
      isBridgeable: true,
      IconComponent: CelestiaIcon,
    }),
    WRAPPED_NATIVE_TOKEN,
    new EvmCurrency({
      chainId: 253368190,
      coinDenom: "dTIA",
      title: "Drop Staked TIA",
      coinMinimalDenom:
        "factory/neutron1ut4c6pv4u6vyu97yw48y8g7mle0cat54848v6m97k977022lzxtsaqsgmq/udtia",
      coinDecimals: 18,
      erc20ContractAddress: "0x1E3b0f82d049379FEd8C0b67D915Ea925067e5f2",
      wrapped: null,
      isNative: false,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "0",
      isBridgeable: true,
      IconComponent: DropTiaIcon,
    }),
    new EvmCurrency({
      chainId: 253368190,
      coinDenom: "USDC",
      title: "USDC",
      coinMinimalDenom: "uusdc",
      coinDecimals: 6,
      erc20ContractAddress: "0x3f65144F387f6545bF4B19a1B39C94231E1c849F",
      astriaIntentBridgeAddress: "0x685e7fEF1f7aF56A972540DE99CaB371cD9f8A87",
      wrapped: null,
      isNative: false,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "0",
      isBridgeable: true,
      IconComponent: UsdcIcon,
    }),
    new EvmCurrency({
      chainId: 253368190,
      coinDenom: "milkTIA",
      title: "Milk TIA",
      coinMinimalDenom:
        "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
      coinDecimals: 18,
      erc20ContractAddress: "0xcbb93e854AA4EF5Db51c3b094F28952eF0dC67bE",
      wrapped: null,
      isNative: false,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "0",
      isBridgeable: true,
      IconComponent: MilkTiaIcon,
    }),
    new EvmCurrency({
      chainId: 253368190,
      coinDenom: "stTIA",
      title: "Stride TIA",
      coinMinimalDenom: "stutia",
      coinDecimals: 18,
      erc20ContractAddress: "0xdf941D092b10FF07eAb44bD174dEe915c13FECcd",
      wrapped: null,
      isNative: false,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "0",
      isBridgeable: true,
      IconComponent: StrideTiaIcon,
    }),
  ],
  IconComponent: AstriaIcon,
};

export const astriaChains: AstriaChains = {
  Astria: AstriaChainInfo,
};

const BaseChainInfo: EvmChainInfo = {
  chainType: ChainType.EVM,
  chainId: 8453,
  chainName: "Base",
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrl: "https://basescan.org/",
  contracts: {},
  currencies: [
    // NOTE - the native currency is really only here to satisfy the config needed
    //  for wagmi providers. it's not used atm.
    new EvmCurrency({
      chainId: 8453,
      title: "Ether",
      coinDenom: "ETH",
      // is gwei correct?
      coinMinimalDenom: "gwei",
      coinDecimals: 18,
      wrapped: null,
      isNative: true,
      isWrappedNative: false,
      isBridgeable: false,
    }),
    new EvmCurrency({
      chainId: 8453,
      title: "USDC",
      coinDenom: "USDC",
      coinMinimalDenom: "uusdc",
      coinDecimals: 6,
      erc20ContractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      astriaIntentBridgeAddress: "0x685e7fEF1f7aF56A972540DE99CaB371cD9f8A87",
      wrapped: null,
      isNative: false,
      isWrappedNative: false,
      isBridgeable: true,
      IconComponent: UsdcIcon,
    }),
  ],
  IconComponent: BaseIcon,
};

export const coinbaseChains: CoinbaseChains = {
  Base: BaseChainInfo,
};
