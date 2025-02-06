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
    "\n  query Vaults($first: Int, $skip: Int) {\n    vaults(first: $first, skip: $skip, where: { totalAssets_gte: 1 }) {\n      items {\n        address\n        symbol\n        name\n        creationTimestamp\n        asset {\n          id\n          address\n          decimals\n          logoURI\n        }\n        chain {\n          id\n          network\n        }\n        metadata {\n          curators {\n            name\n            image\n          }\n        }\n        state {\n          id\n          apy\n          netApy\n          totalAssets\n          totalAssetsUsd\n        }\n      }\n      pageInfo {\n        countTotal\n        count\n        limit\n        skip\n      }\n    }\n  }\n": typeof types.VaultsDocument,
};
const documents: Documents = {
    "\n  query Vaults($first: Int, $skip: Int) {\n    vaults(first: $first, skip: $skip, where: { totalAssets_gte: 1 }) {\n      items {\n        address\n        symbol\n        name\n        creationTimestamp\n        asset {\n          id\n          address\n          decimals\n          logoURI\n        }\n        chain {\n          id\n          network\n        }\n        metadata {\n          curators {\n            name\n            image\n          }\n        }\n        state {\n          id\n          apy\n          netApy\n          totalAssets\n          totalAssetsUsd\n        }\n      }\n      pageInfo {\n        countTotal\n        count\n        limit\n        skip\n      }\n    }\n  }\n": types.VaultsDocument,
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
export function graphql(source: "\n  query Vaults($first: Int, $skip: Int) {\n    vaults(first: $first, skip: $skip, where: { totalAssets_gte: 1 }) {\n      items {\n        address\n        symbol\n        name\n        creationTimestamp\n        asset {\n          id\n          address\n          decimals\n          logoURI\n        }\n        chain {\n          id\n          network\n        }\n        metadata {\n          curators {\n            name\n            image\n          }\n        }\n        state {\n          id\n          apy\n          netApy\n          totalAssets\n          totalAssetsUsd\n        }\n      }\n      pageInfo {\n        countTotal\n        count\n        limit\n        skip\n      }\n    }\n  }\n"): (typeof documents)["\n  query Vaults($first: Int, $skip: Int) {\n    vaults(first: $first, skip: $skip, where: { totalAssets_gte: 1 }) {\n      items {\n        address\n        symbol\n        name\n        creationTimestamp\n        asset {\n          id\n          address\n          decimals\n          logoURI\n        }\n        chain {\n          id\n          network\n        }\n        metadata {\n          curators {\n            name\n            image\n          }\n        }\n        state {\n          id\n          apy\n          netApy\n          totalAssets\n          totalAssetsUsd\n        }\n      }\n      pageInfo {\n        countTotal\n        count\n        limit\n        skip\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;