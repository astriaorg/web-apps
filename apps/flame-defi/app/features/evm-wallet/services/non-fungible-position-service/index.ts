import type { Config } from "@wagmi/core";
import { type Address, Abi } from "viem";
import { HexString } from "@repo/flame-types";
import { GenericContractService } from "../generic-contract-service";
import NON_FUNGIBLE_POSITION_MANAGER_ABI from "./non-fungible-position-manager-abi.json";
import { GetAllPoolPositionsResponse, PoolPositionResponse } from "pool/types";

type PositionResponseTuple = [
  bigint, // nonce
  string, // operator
  Address, // tokenAddress0
  Address, // tokenAddress1
  bigint, // fee
  bigint, // tickLower
  bigint, // tickUpper
  bigint, // liquidity
  bigint, // feeGrowthInside0LastX128
  bigint, // feeGrowthInside1LastX128
  bigint, // tokensOwed0
  bigint, // tokensOwed1
];

export class NonFungiblePositionService extends GenericContractService {
  /**
   * Creates a new NonFungiblePositionService instance
   *
   * @param wagmiConfig - The wagmi configuration object
   * @param contractAddress - The address of the NonFungiblePositionManager contract
   */
  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(
      wagmiConfig,
      contractAddress,
      NON_FUNGIBLE_POSITION_MANAGER_ABI as Abi,
    );
  }

  /**
   * Get the pool positions of a user.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param tokenId - The ID of the token
   * @returns Object containing position data including liquidity, ticks, and fees
   */
  async positions(
    chainId: number,
    tokenId: string,
  ): Promise<PoolPositionResponse> {
    const positionsArray = await this.readContractMethod<PositionResponseTuple>(
      chainId,
      "positions",
      [tokenId],
    );

    const position: PoolPositionResponse = {
      nonce: positionsArray[0],
      operator: positionsArray[1],
      tokenAddress0: positionsArray[2],
      tokenAddress1: positionsArray[3],
      fee: Number(positionsArray[4]),
      tickLower: Number(positionsArray[5]),
      tickUpper: Number(positionsArray[6]),
      liquidity: positionsArray[7],
      feeGrowthInside0LastX128: positionsArray[8],
      feeGrowthInside1LastX128: positionsArray[9],
      tokensOwed0: positionsArray[10],
      tokensOwed1: positionsArray[11],
    };

    return position;
  }

  /**
   * Creates a new position in a Uniswap V3 pool
   *
   * @param chainId - The chain ID of the EVM chain
   * @param token0 - The address of the first token in the pair
   * @param token1 - The address of the second token in the pair
   * @param fee - The fee tier of the pool (e.g., 500 for 0.05%, 3000 for 0.3%)
   * @param tickLower - The lower tick boundary of the position
   * @param tickUpper - The upper tick boundary of the position
   * @param amount0Desired - The desired amount of token0 to deposit
   * @param amount1Desired - The desired amount of token1 to deposit
   * @param amount0Min - The minimum amount of token0 to deposit
   * @param amount1Min - The minimum amount of token1 to deposit
   * @param recipient - The address that will receive the NFT
   * @param deadline - The timestamp by which the transaction must be executed
   * @returns Object containing transaction hash if successful
   */
  async mint(
    chainId: number,
    token0: Address,
    token1: Address,
    fee: number,
    tickLower: number,
    tickUpper: number,
    amount0Desired: number,
    amount1Desired: number,
    amount0Min: number,
    amount1Min: number,
    recipient: Address,
    deadline: number,
  ): Promise<HexString> {
    const txHash = await this.writeContractMethod(chainId, "mint", [
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      amount0Desired,
      amount1Desired,
      amount0Min,
      amount1Min,
      recipient,
      deadline,
    ]);

    return txHash;
  }

  /**
   * Decreases the amount of liquidity in a position and accounts it to the position.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param tokenId - The ID of the NFT position to decrease liquidity in
   * @param liquidity - The amount by which liquidity will be decreased
   * @param amount0Min - The minimum amount of token0 that should be accounted for the burned liquidity
   * @param amount1Min - The minimum amount of token1 that should be accounted for the burned liquidity
   * @param deadline - The time by which the transaction must be included to effect the change
   * @returns Object containing transaction hash if successful
   */
  async decreaseLiquidity(
    chainId: number,
    tokenId: string,
    liquidity: number,
    amount0Min: number,
    amount1Min: number,
    deadline: number,
  ): Promise<HexString> {
    const txHash = await this.writeContractMethod(
      chainId,
      "decreaseLiquidity",
      [tokenId, liquidity, amount0Min, amount1Min, deadline],
    );

    return txHash;
  }

  /**
   * Collect fees and/or tokens from a position.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param tokenId - The ID of the token
   * @param recipient - The address that will receive the collected tokens
   * @param amount0Max - The maximum amount of token0 to collect
   * @param amount1Max - The maximum amount of token1 to collect
   * @returns Object containing transaction hash if successful
   */
  async collect(
    chainId: number,
    tokenId: string,
    recipient: Address,
    amount0Max: number,
    amount1Max: number,
  ): Promise<HexString> {
    const txHash = await this.writeContractMethod(chainId, "collect", [
      tokenId,
      recipient,
      amount0Max,
      amount1Max,
    ]);

    return txHash;
  }

  /**
   * Get the number of NFTs owned by an address
   *
   * @param chainId - The chain ID of the EVM chain
   * @param owner - The address to check the balance of
   * @returns The number of NFTs owned by the address as a bigint
   */
  async balanceOf(chainId: number, owner: Address): Promise<bigint> {
    return await this.readContractMethod<bigint>(chainId, "balanceOf", [owner]);
  }

  /**
   * Get the token ID at a given index of the owner's token list
   *
   * @param chainId - The chain ID of the EVM chain
   * @param owner - The address of the NFT owner
   * @param index - The index in the owner's token list
   * @returns The token ID at the specified index
   */
  async tokenOfOwnerByIndex(
    chainId: number,
    owner: Address,
    index: number,
  ): Promise<bigint> {
    return await this.readContractMethod<bigint>(
      chainId,
      "tokenOfOwnerByIndex",
      [owner, index],
    );
  }

  /**
   * Get all NFT positions owned by an address
   *
   * @param chainId - The chain ID of the EVM chain
   * @param owner - The address to get positions for
   * @returns An array of position data for all NFTs owned by the address
   */
  async getAllPositions(
    chainId: number,
    owner: Address,
  ): Promise<GetAllPoolPositionsResponse[]> {
    const nftCount = await this.balanceOf(chainId, owner);
    const positions: GetAllPoolPositionsResponse[] = [];

    for (let i = 0; i < Number(nftCount); i++) {
      const tokenId = await this.tokenOfOwnerByIndex(chainId, owner, i);
      const position = await this.positions(chainId, tokenId.toString());
      positions.push({ ...position, tokenId: tokenId.toString() });
    }

    return positions;
  }
}

/**
 * Factory function to create a new NonFungiblePositionService instance
 *
 * @param wagmiConfig - The wagmi configuration object
 * @param contractAddress - The address of the NonFungiblePositionManager contract
 * @returns A new NonFungiblePositionService instance
 */
export function createNonFungiblePositionService(
  wagmiConfig: Config,
  contractAddress: Address,
): NonFungiblePositionService {
  return new NonFungiblePositionService(wagmiConfig, contractAddress);
}
