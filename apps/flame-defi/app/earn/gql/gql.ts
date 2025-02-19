/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query VaultByAddress(\n    $address: String!\n    $chainId: Int\n    $dailyAPYOptions: TimeseriesOptions\n  ) {\n    vaultByAddress(address: $address, chainId: $chainId) {\n      address\n      asset {\n        decimals\n        logoURI\n        name\n        symbol\n      }\n      historicalState {\n        dailyApy(options: $dailyAPYOptions) {\n          x\n          y\n        }\n      }\n      liquidity {\n        underlying\n        usd\n      }\n      metadata {\n        curators {\n          image\n          name\n        }\n        description\n      }\n      name\n      state {\n        apy\n        fee\n        guardian\n        totalAssets\n        totalAssetsUsd\n      }\n      symbol\n    }\n  }\n": typeof types.VaultByAddressDocument,
    "\n  query Vaults(\n    $first: Int\n    $skip: Int\n    $orderBy: VaultOrderBy\n    $orderDirection: OrderDirection\n    $where: VaultFilters\n  ) {\n    vaults(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      items {\n        address\n        symbol\n        name\n        asset {\n          address\n          decimals\n          logoURI\n        }\n        state {\n          apy\n          totalAssets\n          totalAssetsUsd\n        }\n      }\n      pageInfo {\n        countTotal\n        count\n        limit\n        skip\n      }\n    }\n  }\n": typeof types.VaultsDocument,
};
const documents: Documents = {
    "\n  query VaultByAddress(\n    $address: String!\n    $chainId: Int\n    $dailyAPYOptions: TimeseriesOptions\n  ) {\n    vaultByAddress(address: $address, chainId: $chainId) {\n      address\n      asset {\n        decimals\n        logoURI\n        name\n        symbol\n      }\n      historicalState {\n        dailyApy(options: $dailyAPYOptions) {\n          x\n          y\n        }\n      }\n      liquidity {\n        underlying\n        usd\n      }\n      metadata {\n        curators {\n          image\n          name\n        }\n        description\n      }\n      name\n      state {\n        apy\n        fee\n        guardian\n        totalAssets\n        totalAssetsUsd\n      }\n      symbol\n    }\n  }\n": types.VaultByAddressDocument,
    "\n  query Vaults(\n    $first: Int\n    $skip: Int\n    $orderBy: VaultOrderBy\n    $orderDirection: OrderDirection\n    $where: VaultFilters\n  ) {\n    vaults(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      items {\n        address\n        symbol\n        name\n        asset {\n          address\n          decimals\n          logoURI\n        }\n        state {\n          apy\n          totalAssets\n          totalAssetsUsd\n        }\n      }\n      pageInfo {\n        countTotal\n        count\n        limit\n        skip\n      }\n    }\n  }\n": types.VaultsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VaultByAddress(\n    $address: String!\n    $chainId: Int\n    $dailyAPYOptions: TimeseriesOptions\n  ) {\n    vaultByAddress(address: $address, chainId: $chainId) {\n      address\n      asset {\n        decimals\n        logoURI\n        name\n        symbol\n      }\n      historicalState {\n        dailyApy(options: $dailyAPYOptions) {\n          x\n          y\n        }\n      }\n      liquidity {\n        underlying\n        usd\n      }\n      metadata {\n        curators {\n          image\n          name\n        }\n        description\n      }\n      name\n      state {\n        apy\n        fee\n        guardian\n        totalAssets\n        totalAssetsUsd\n      }\n      symbol\n    }\n  }\n"): (typeof documents)["\n  query VaultByAddress(\n    $address: String!\n    $chainId: Int\n    $dailyAPYOptions: TimeseriesOptions\n  ) {\n    vaultByAddress(address: $address, chainId: $chainId) {\n      address\n      asset {\n        decimals\n        logoURI\n        name\n        symbol\n      }\n      historicalState {\n        dailyApy(options: $dailyAPYOptions) {\n          x\n          y\n        }\n      }\n      liquidity {\n        underlying\n        usd\n      }\n      metadata {\n        curators {\n          image\n          name\n        }\n        description\n      }\n      name\n      state {\n        apy\n        fee\n        guardian\n        totalAssets\n        totalAssetsUsd\n      }\n      symbol\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Vaults(\n    $first: Int\n    $skip: Int\n    $orderBy: VaultOrderBy\n    $orderDirection: OrderDirection\n    $where: VaultFilters\n  ) {\n    vaults(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      items {\n        address\n        symbol\n        name\n        asset {\n          address\n          decimals\n          logoURI\n        }\n        state {\n          apy\n          totalAssets\n          totalAssetsUsd\n        }\n      }\n      pageInfo {\n        countTotal\n        count\n        limit\n        skip\n      }\n    }\n  }\n"): (typeof documents)["\n  query Vaults(\n    $first: Int\n    $skip: Int\n    $orderBy: VaultOrderBy\n    $orderDirection: OrderDirection\n    $where: VaultFilters\n  ) {\n    vaults(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      items {\n        address\n        symbol\n        name\n        asset {\n          address\n          decimals\n          logoURI\n        }\n        state {\n          apy\n          totalAssets\n          totalAssetsUsd\n        }\n      }\n      pageInfo {\n        countTotal\n        count\n        limit\n        skip\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;