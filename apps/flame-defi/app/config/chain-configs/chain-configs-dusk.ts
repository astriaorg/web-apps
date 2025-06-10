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
  WrappedTiaIcon,
} from "@repo/ui/icons/polychrome";

const CelestiaChainInfo: CosmosChainInfo = {
  chainType: ChainType.COSMOS,
  // Chain-id of the celestia chain.
  chainId: "mocha-4",
  // The name of the chain to be displayed to the user.
  chainName: "Celestia Mocha-4",
  // RPC endpoint of the chain
  rpc: "wss://rpc-mocha.pops.one",
  // REST endpoint of the chain.
  rest: "https://api-mocha.pops.one",
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
      chainId: "mocha-4",
      coinDenom: "TIA",
      coinMinimalDenom: "utia",
      coinDecimals: 6,
      isDepositable: true,
      isWithdrawable: true,
      isNative: true,
      ibcChannel: "channel-159",
      sequencerBridgeAccount: "astria17hvahh8lcas4fhl5urqjnhfqwhffkddaw034lh",
      title: "TIA",
      IconComponent: CelestiaIcon,
    }),
    new IbcCurrency({
      chainId: "mocha-4",
      coinDenom: "fakeTIA",
      coinMinimalDenom: "ufaketia",
      coinDecimals: 6,
      isDepositable: false,
      isWithdrawable: true,
      isNative: false,
      ibcChannel: "channel-420",
      sequencerBridgeAccount: "astria17hvahh8lcas4fhl5urqjnhfqwhffkddaw034lh",
      title: "fakeTIA",
      IconComponent: CelestiaIcon,
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
  chainId: "grand-1",
  chainName: "Noble Testnet",
  // RPC endpoint of the chain
  // rpc: "https://rpc.testnet.noble.strange.love:443",
  // rpc: "https://rpc.testnet.noble.strange.love",
  rpc: "https://noble-testnet-rpc.polkachu.com",
  // REST endpoint of the chain.
  rest: "https://noble-testnet-api.polkachu.com",
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
      chainId: "grand-1",
      coinDenom: "USDC",
      coinMinimalDenom: "uusdc",
      coinDecimals: 6,
      isDepositable: false,
      isWithdrawable: true,
      isNative: true,
      ibcChannel: "channel-231",
      sequencerBridgeAccount: "astria12saluecm8dd7hkutk83eavkl2p70lf5w7txezg",
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
  "Celestia Mocha-4": CelestiaChainInfo,
  "Noble Testnet": NobleChainInfo,
};

const WRAPPED_NATIVE_TOKEN = new EvmCurrency({
  chainId: 912559,
  coinDenom: "WTIA",
  title: "Wrapped Celestia",
  coinMinimalDenom: "wtia",
  coinDecimals: 18,
  erc20ContractAddress: "0x6D71eb44a65560D1E917861059288200209054b4",
  wrapped: null,
  isNative: false,
  isWrappedNative: true,
  ibcWithdrawalFeeWei: "0",
  isDepositable: true,
  isWithdrawable: true,
  IconComponent: WrappedTiaIcon,
});

const FlameChainInfo: AstriaChain = {
  chainType: ChainType.ASTRIA,
  chainId: 912559,
  chainName: "Flame Dusk-11",
  rpcUrls: ["https://rpc.evm.dusk-11.devnet.astria.org"],
  blockExplorerUrl: "https://explorer.evm.dusk-11.devnet.astria.org",
  contracts: {
    wrappedNativeToken: {
      address: "0x6D71eb44a65560D1E917861059288200209054b4",
    },
    swapRouter: {
      address: "0x9ed37af540E50ddcCD2dd4D71d61BD458e9229c6",
    },
    poolFactory: {
      address: "0xc40CAc88C65B5fa4B3EE4FEAe2Cea443287f3879",
    },
    poolContract: {
      address: "0x49140762cc67fd5495678a8952506526bc232737",
    },
    nonfungiblePositionManager: {
      address: "0x371cC275651E799890E8409102D7Cc1910647ceD",
    },
    multicall3: {
      address: "0x",
    },
  },
  currencies: [
    new EvmCurrency({
      chainId: 912559,
      coinDenom: "RIA",
      title: "RIA",
      coinMinimalDenom: "uria",
      coinDecimals: 18,
      wrapped: WRAPPED_NATIVE_TOKEN,
      isNative: true,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "0",
      isDepositable: true,
      isWithdrawable: true,
      IconComponent: CelestiaIcon,
    }),
    WRAPPED_NATIVE_TOKEN,
    new EvmCurrency({
      chainId: 912559,
      coinDenom: "USDC",
      title: "USDC",
      coinMinimalDenom: "uusdc",
      coinDecimals: 18,
      // address of erc20 contract on dusk-11
      erc20ContractAddress: "0xa4f59B3E97EC22a2b949cB5b6E8Cd6135437E857",
      // this value would only exist for native tokens
      // nativeTokenWithdrawerContractAddress: "",
      wrapped: null,
      isNative: false,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "0",
      isDepositable: false,
      isWithdrawable: true,
      IconComponent: NobleIcon,
    }),
    new EvmCurrency({
      chainId: 912559,
      coinDenom: "fakeTIA",
      title: "fakeTIA",
      coinMinimalDenom: "ufaketia",
      coinDecimals: 6,
      // NOTE - there is not actually a contract for this fakeTIA.
      //  just using this for testing the UI.
      erc20ContractAddress: "0xFc83F6A786728F448481B7D7d5C0659A92a62C4d",
      // nativeTokenWithdrawerContractAddress: "",
      wrapped: null,
      isNative: false,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "0",
      isDepositable: false,
      isWithdrawable: true,
      IconComponent: CelestiaIcon,
    }),
  ],
  IconComponent: AstriaIcon,
};

export const astriaChains: AstriaChains = {
  "Flame Dusk-11": FlameChainInfo,
};
