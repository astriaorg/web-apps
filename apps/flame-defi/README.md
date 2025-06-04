# Flame Defi Frontend

This directory contains the source code and tooling for the front-end for
the Astria Flame app.

## `flame-defi` application directory structure

### Application directory structure

- `app/bridge` - bridge page
- `app/borrow` - borrow page
- `app/components` - More general React components for the app, e.g. `NavigationMenu`,
  Dropdown, CopyToClipboardButton, etc
- `app/config` - Configuration for the app
  - `app/config/chain-configs` - Celestia and Astria chain information
  - `app/config/contexts` - Config context and context provider
  - `app/config/hooks` - Custom hook to make config easy to use
  - `app/config/env.ts` - Environment variable definitions plus utilities for
    consuming them
  - `app/config/index.ts` - AppConfig and exports
- `app/earn` - earn page
- `app/features` - Organizes components, contexts, hooks, services, types, and
  utils for different features
  - `app/features/cosmos-kit` - Cosmos Kit integration
  - `app/features/cosmos-wallet` - Used for interacting with Cosmos wallets
  - `app/features/evm-wallet` - Used for interacting with EVM wallets
  - `app/features/notifications` - Used for displaying notifications and toasts
  - `app/features/onchain-kit` - Onchain Kit integration
  - `app/features/privy` - Privy integration
  - `app/features/wagmi-rainbow-kit` - Wagmi/Rainbow Kit integration
  - `app/features/wallet-connect` - WalletConnect integration
- `app/pool` - pool page
- `app/swap` - swap page
- `app/testing/helpers.tsx` - helper functions for testing
- `app/favicon.ico` - favicon
- `app/globals.css` - global styles
- `app/layout.tsx` - the root layout for the app
- `app/page.tsx` - the root page for the app
- `app/providers.tsx` - the providers for the app
- `types-for-contrib.d.ts` - types for 3rd party libraries

### Non-application files

- `.aidigestignore` - files to ignore when running `aidigest`
- `eslint.config.js` - eslint config
- `jest.config.ts` - jest configuration
- `jest.setup.tsx`
  - most jest mocks defined here (some mocks defined in individual test files)
  - browser global mocks defined here
- `justfile` - commands to aid in development
- `next.config.js` - Next.js configuration
- `next-env.d.ts` - Next.js types
- `postcss.config.js` - PostCSS configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

## Commands

```bash
# install npm deps and run app locally
just cp-env
npm install
npm run dev

# test, format, lint
npm run test
npm run format
npm run lint
# or with just
just t
just f
just l

# build app static files
npm run build
```

## How Tos

- How to add new chain configs for a new network (e.g. you want to add new
  chain configs for "mainnet")

  - create file that will contain the config values

    ```sh
    touch ./app/config/chain-configs/chain-configs-mainnet.ts
    ```

  - import new configs in
    `./app/config/chain-configs/index.ts`, while renaming
    them

    ```typescript
    import * as mainnet from "./chain-configs-mainnet";
    ```

  - add entry to `NETWORK_CONFIGS`

    ```typescript
    const NETWORK_CONFIGS: Record<FlameNetwork, ChainConfigs> = {
      [FlameNetwork.LOCAL]: local,
      [FlameNetwork.DUSK]: dusk,
      [FlameNetwork.DAWN]: dawn,
      [FlameNetwork.MAINNET]: mainnet,
    };
    ```
