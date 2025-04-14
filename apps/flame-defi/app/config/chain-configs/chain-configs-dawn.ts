import {
  BaseIcon,
  CelestiaIcon,
  DropTiaIcon,
  FlameIcon,
  NeutronIcon,
  NobleIcon,
  UsdcIcon,
  WrappedTiaIcon,
} from "@repo/ui/icons";
import {
  AstriaChain,
  ChainType,
  CoinbaseChains,
  CosmosChainInfo,
  CosmosChains,
  EvmChainInfo,
  AstriaChains,
  EvmCurrency,
} from "@repo/flame-types";

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
      ibcChannel: "channel-160",
      sequencerBridgeAccount: "astria1lepnry7tlpzvrukp5xej4v5wp532k2f94vxqnr",
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
    {
      // Coin denomination to be displayed to the user.
      coinDenom: "USDC",
      // Actual denom (i.e. uatom, uscrt) used by the blockchain.
      coinMinimalDenom: "uusdc",
      // # of decimal points to convert minimal denomination to user-facing denomination.
      coinDecimals: 6,
      // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
      // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
      // coinGeckoId: ""
      ibcChannel: "channel-232",
      sequencerBridgeAccount: "astria1u6ewl0tejz0df2l6tzc7k2degx6mqsjahldqxd",
      IconComponent: NobleIcon,
    },
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
    {
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
      ibcChannel: "channel-1412",
      sequencerBridgeAccount: "astria1j7juyc9nv6tlv0la74a9rrm7v72y3x336mgxvk",
      IconComponent: DropTiaIcon,
    },
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
  },
  currencies: [
    new EvmCurrency({
      coinDenom: "TIA",
      title: "TIA",
      coinMinimalDenom: "utia",
      coinDecimals: 18,
      nativeTokenWithdrawerContractAddress:
        "0x77Af806d724699B3644F9CCBFD45CC999CCC3d49",
      isNative: true,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "10000000000000000",
      isBridgeable: true,
      IconComponent: CelestiaIcon,
    }),
    new EvmCurrency({
      coinDenom: "WTIA",
      title: "Wrapped Celestia",
      coinMinimalDenom: "wtia",
      coinDecimals: 18,
      erc20ContractAddress: "0xb1ed550217B33fdBeA6aA81b074A2DF8979AfA94",
      isNative: false,
      isWrappedNative: true,
      ibcWithdrawalFeeWei: "10000000000000000",
      isBridgeable: true,
      IconComponent: WrappedTiaIcon,
    }),
    new EvmCurrency({
      coinDenom: "USDC",
      title: "USDC",
      coinMinimalDenom: "uusdc",
      coinDecimals: 18,
      erc20ContractAddress: "0x6e18cE6Ec3Fc7b8E3EcFca4fA35e25F3f6FA879a",
      isNative: false,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "10000000000000000",
      isBridgeable: true,
      IconComponent: NobleIcon,
    }),
    new EvmCurrency({
      coinDenom: "dTIA",
      title: "Drop Staked TIA",
      coinMinimalDenom:
        "factory/neutron1tkr6mtll5e2z53ze2urnc3ld3tq3dam2rchezc5lg9c237ft66gqtw94jm/drop",
      coinDecimals: 18,
      erc20ContractAddress: "0x0F0C3207a9fE9B7e8AaE4bb83E865C91A13Fd8a7",
      isNative: false,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "10000000000000000",
      isBridgeable: true,
      IconComponent: DropTiaIcon,
    }),
  ],
  IconComponent: FlameIcon,
};

export const astriaChains: AstriaChains = {
  "Flame Dawn-1": FlameChainInfo,
};

const BaseChainInfo: EvmChainInfo = {
  chainType: ChainType.EVM,
  chainId: 84532,
  chainName: "Base Sepolia",
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrl: "https://sepolia.basescan.org",
  contracts: {},
  currencies: [
    // NOTE - this is really only here to satisfy the config needed
    //  for wagmi and rainbowkit providers. it's not used atm.
    new EvmCurrency({
      title: "Ether",
      coinDenom: "ETH",
      // is gwei correct?
      coinMinimalDenom: "gwei",
      coinDecimals: 18,
      isNative: true,
      isWrappedNative: false,
      isBridgeable: false,
    }),
    new EvmCurrency({
      coinDenom: "USDC",
      title: "USDC",
      coinMinimalDenom: "uusdc",
      coinDecimals: 6,
      erc20ContractAddress: "0x081827b8C3Aa05287b5aA2bC3051fbE638F33152",
      astriaIntentBridgeAddress: "0x",
      isNative: false,
      isWrappedNative: false,
      ibcWithdrawalFeeWei: "10000000000000000",
      isBridgeable: true,
      IconComponent: UsdcIcon,
    }),
  ],
  IconComponent: BaseIcon,
};

export const coinbaseChains: CoinbaseChains = {
  Base: BaseChainInfo,
};
