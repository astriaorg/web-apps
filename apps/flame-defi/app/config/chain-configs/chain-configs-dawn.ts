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
  DropTiaIcon,
  NeutronIcon,
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
      ibcChannel: "channel-160",
      sequencerBridgeAccount: "astria1lepnry7tlpzvrukp5xej4v5wp532k2f94vxqnr",
      title: "TIA",
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
      ibcChannel: "channel-232",
      sequencerBridgeAccount: "astria1u6ewl0tejz0df2l6tzc7k2degx6mqsjahldqxd",
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

const NeutronChainInfo: CosmosChainInfo = {
  chainType: ChainType.COSMOS,
  chainId: "pion-1",
  chainName: "Neutron Testnet",
  // RPC endpoint of the chain
  // rpc: "https://rpc.testnet.noble.strange.love:443",
  // rpc: "https://rpc.testnet.noble.strange.love",
  rpc: "https://rpc-falcron.pion-1.ntrn.tech",
  // REST endpoint of the chain.
  rest: "https://rest-falcron.pion-1.ntrn.tech",
  // Staking coin information
  stakeCurrency: {
    // Coin denomination to be displayed to the user.
    coinDenom: "dTIA",
    // Actual denom (i.e. uatom, uscrt) used by the blockchain.
    coinMinimalDenom:
      "factory/neutron1tkr6mtll5e2z53ze2urnc3ld3tq3dam2rchezc5lg9c237ft66gqtw94jm/drop",
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
      chainId: "pion-1",
      coinDenom: "dTIA",
      coinMinimalDenom:
        "factory/neutron1tkr6mtll5e2z53ze2urnc3ld3tq3dam2rchezc5lg9c237ft66gqtw94jm/drop",
      coinDecimals: 6,
      isDepositable: false,
      isWithdrawable: true,
      isNative: true,
      ibcChannel: "channel-1412",
      sequencerBridgeAccount: "astria1j7juyc9nv6tlv0la74a9rrm7v72y3x336mgxvk",
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
        "factory/neutron1tkr6mtll5e2z53ze2urnc3ld3tq3dam2rchezc5lg9c237ft66gqtw94jm/drop",
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

export const cosmosChains: CosmosChains = {
  "Celestia Mocha-4": CelestiaChainInfo,
  "Noble Testnet": NobleChainInfo,
  "Neutron Testnet": NeutronChainInfo,
};

const WRAPPED_NATIVE_TOKEN = new EvmCurrency({
  chainId: 16604737732183,
  coinDenom: "WTIA",
  title: "Wrapped Celestia",
  coinMinimalDenom: "wtia",
  coinDecimals: 18,
  erc20ContractAddress: "0xb1ed550217B33fdBeA6aA81b074A2DF8979AfA94",
  wrapped: null,
  isNative: false,
  isWrappedNative: true,
  ibcWithdrawalFeeWei: "10000000000000000",
  isDepositable: true,
  isWithdrawable: true,
  IconComponent: WrappedTiaIcon,
});

const FlameChainInfo: AstriaChain = {
  chainType: ChainType.ASTRIA,
  chainId: 16604737732183,
  chainName: "Flame Dawn-1",
  rpcUrls: ["https://rpc.flame.dawn-1.astria.org"],
  blockExplorerUrl: "https://explorer.flame.dawn-1.astria.org",
  contracts: {
    wrappedNativeToken: {
      address: "0xb1ed550217B33fdBeA6aA81b074A2DF8979AfA94",
    },
    swapRouter: {
      address: "0x0DA34E6C6361f5B8f5Bdb6276fEE16dD241108c8",
    },
    poolFactory: {
      address: "0xbdb7C721ae69f36A303162E1e1FBC5ec445824E7",
    },
    poolContract: {
      address: "0xAAF22d4931147EDdf1269B16B17DB6F51aF9854D",
    },
    nonfungiblePositionManager: {
      address: "0x186C4bFBef4748d78Bc3C7B7628298528BbFEe47",
    },
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    },
  },
  currencies: [
    new EvmCurrency({
      chainId: 16604737732183,
      coinDenom: "TIA",
      title: "TIA",
      coinMinimalDenom: "utia",
      coinDecimals: 18,
      nativeTokenWithdrawerContractAddress:
        "0x77Af806d724699B3644F9CCBFD45CC999CCC3d49",
      wrapped: WRAPPED_NATIVE_TOKEN,
      isNative: true,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "10000000000000000",
      isDepositable: true,
      isWithdrawable: true,
      IconComponent: CelestiaIcon,
    }),
    WRAPPED_NATIVE_TOKEN,
    new EvmCurrency({
      chainId: 16604737732183,
      coinDenom: "USDC",
      title: "USDC",
      coinMinimalDenom: "uusdc",
      coinDecimals: 18,
      erc20ContractAddress: "0x6e18cE6Ec3Fc7b8E3EcFca4fA35e25F3f6FA879a",
      wrapped: null,
      isNative: false,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "0",
      isDepositable: false,
      isWithdrawable: true,
      IconComponent: NobleIcon,
    }),
    new EvmCurrency({
      chainId: 16604737732183,
      coinDenom: "dTIA",
      title: "Drop Staked TIA",
      coinMinimalDenom:
        "factory/neutron1tkr6mtll5e2z53ze2urnc3ld3tq3dam2rchezc5lg9c237ft66gqtw94jm/drop",
      coinDecimals: 18,
      erc20ContractAddress: "0x0F0C3207a9fE9B7e8AaE4bb83E865C91A13Fd8a7",
      isNative: false,
      isWrappedNative: false,
      wrapped: null,
      ibcWithdrawalFeeWei: "0",
      isDepositable: false,
      isWithdrawable: true,
      IconComponent: DropTiaIcon,
    }),
  ],
  IconComponent: AstriaIcon,
};

export const astriaChains: AstriaChains = {
  "Flame Dawn-1": FlameChainInfo,
};
