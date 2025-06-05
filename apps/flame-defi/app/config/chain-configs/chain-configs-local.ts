import {
  AstriaChain,
  AstriaChains,
  ChainType,
  CosmosChainInfo,
  CosmosChains,
  EvmCurrency,
  IbcCurrency,
} from "@repo/flame-types";
import {
  AstriaIcon,
  CelestiaIcon,
  NobleIcon,
  UsdcIcon,
} from "@repo/ui/icons/polychrome";

const CelestiaChainInfo: CosmosChainInfo = {
  chainType: ChainType.COSMOS,
  // Chain-id of the celestia chain.
  chainId: "celestia-local-0",
  // The name of the chain to be displayed to the user.
  chainName: "Celestia Local",
  // RPC endpoint of the chain
  rpc: "http://rpc.app.celestia.localdev.me",
  // REST endpoint of the chain.
  rest: "http://rest.app.celestia.localdev.me",
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
    new IbcCurrency({
      chainId: "celestia-local-0",
      coinDenom: "TIA",
      coinMinimalDenom: "utia",
      coinDecimals: 6,
      isBridgeable: true,
      isNative: true,
      ibcChannel: "channel-1",
      sequencerBridgeAccount: "astria14wyh2u6efndllr8gup29295krc98rqas8d0ans",
      title: "TIA",
      IconComponent: CelestiaIcon,
    }),
    new IbcCurrency({
      chainId: "celestia-local-0",
      coinDenom: "STEEZE",
      coinMinimalDenom: "usteeze",
      coinDecimals: 6,
      isBridgeable: false,
      isNative: false,
      title: "STEEZE",
    }),
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
  chainType: ChainType.COSMOS,
  chainId: "noble-local-0",
  chainName: "noble-local-0",
  // RPC endpoint of the chain
  rpc: "http://rpc.app.noble.localdev.me",
  // REST endpoint of the chain.
  rest: "http://rest.app.noble.localdev.me",
  // Staking coin information
  stakeCurrency: {
    // Coin denomination to be displayed to the user.
    coinDenom: "USDC",
    // Actual denom (i.e. uatom, uscrt) used by the blockchain.
    coinMinimalDenom: "uusdc",
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
    bech32PrefixAccAddr: "noble",
    bech32PrefixAccPub: "noblepub",
    bech32PrefixConsAddr: "noblevalcons",
    bech32PrefixConsPub: "noblevalconspub",
    bech32PrefixValAddr: "noblevaloper",
    bech32PrefixValPub: "noblevaloperpub",
  },
  // List of all coin/tokens used in this chain.
  currencies: [
    new IbcCurrency({
      chainId: "noble-local-0",
      coinDenom: "usdc",
      coinMinimalDenom: "uusdc",
      coinDecimals: 6,
      isBridgeable: false,
      isNative: true,
      ibcChannel: "channel-0",
      // NOTE - noble requires bech32 address, not bech32m.
      sequencerBridgeAccount: "astria14wyh2u6efndllr8gup29295krc98rqasj3l3kj",
      title: "USDC",
      IconComponent: NobleIcon,
    }),
  ],
  // List of coin/tokens used as a fee token in this chain.
  feeCurrencies: [
    {
      // Coin denomination to be displayed to the user.
      coinDenom: "USDC",
      // Actual denom (i.e. nria, uscrt) used by the blockchain.
      coinMinimalDenom: "usdc",
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
  IconComponent: NobleIcon,
};

export const cosmosChains: CosmosChains = {
  "Celestia Local": CelestiaChainInfo,
  "Noble Local": NobleChainInfo,
};

const WRAPPED_NATIVE_TOKEN = new EvmCurrency({
  chainId: 53,
  title: "TIA",
  coinDenom: "TIA",
  coinMinimalDenom: "utia",
  coinDecimals: 6,
  nativeTokenWithdrawerContractAddress:
    "0xA58639fB5458e65E4fA917FF951C390292C24A15",
  wrapped: null,
  isNative: false,
  isWrappedNative: false,
  ibcWithdrawalFeeWei: "10000000000000000",
  isBridgeable: true,
  IconComponent: CelestiaIcon,
});

const FlameChainInfo: AstriaChain = {
  chainType: ChainType.ASTRIA,
  chainId: 53,
  chainName: "Flame (local)",
  rpcUrls: ["http://localhost:8545"], // TODO
  contracts: {
    wrappedNativeToken: {
      address: "0x",
      blockCreated: 42069,
    },
    swapRouter: {
      address: "0x",
      blockCreated: 42069,
    },
    // TODO - add these addresses
    poolFactory: {
      address: "0x",
    },
    poolContract: {
      address: "0x",
    },
    nonfungiblePositionManager: {
      address: "0x",
    },
    multicall3: {
      address: "0x",
    },
  },
  currencies: [
    new EvmCurrency({
      chainId: 53,
      title: "RIA",
      coinDenom: "RIA",
      coinMinimalDenom: "uria",
      coinDecimals: 18,
      wrapped: WRAPPED_NATIVE_TOKEN,
      isNative: true,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "10000000000000000",
      isBridgeable: true,
      IconComponent: CelestiaIcon,
    }),
    WRAPPED_NATIVE_TOKEN,
  ],
  IconComponent: AstriaIcon,
};

const FakeChainInfo: AstriaChain = {
  chainType: ChainType.ASTRIA,
  chainId: 530,
  chainName: "FakeChain (local)",
  rpcUrls: ["http://localhost:8545"], // TODO
  contracts: {
    wrappedNativeToken: {
      address: "0x",
    },
    swapRouter: {
      address: "0x",
    },
    // TODO - add these addresses
    poolFactory: {
      address: "0x",
    },
    poolContract: {
      address: "0x",
    },
    nonfungiblePositionManager: {
      address: "0x",
    },
    multicall3: {
      address: "0x",
    },
  },
  currencies: [
    new EvmCurrency({
      chainId: 530,
      title: "FAKE",
      coinDenom: "FAKE",
      coinMinimalDenom: "ufake",
      coinDecimals: 18,
      wrapped: null,
      isNative: true,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "10000000000000000",
      isBridgeable: false,
      IconComponent: CelestiaIcon,
    }),
    new EvmCurrency({
      chainId: 530,
      title: "FAKE",
      coinDenom: "FAKE",
      coinMinimalDenom: "ufake",
      coinDecimals: 6,
      // fake address here so it shows up in the currency dropdown
      nativeTokenWithdrawerContractAddress:
        "0x0000000000000000000000000000000000000000",
      wrapped: null,
      isNative: false,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "10000000000000000",
      isBridgeable: false,
      IconComponent: AstriaIcon,
    }),
  ],
  IconComponent: AstriaIcon,
};

export const astriaChains: AstriaChains = {
  "Flame(local)": FlameChainInfo,
  Fake: FakeChainInfo,
};

