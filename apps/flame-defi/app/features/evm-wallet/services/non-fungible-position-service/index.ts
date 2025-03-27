import type { Config } from "@wagmi/core";
import { type Address, Abi } from "viem";
import { GenericContractService } from "../generic-contract-service";
import NON_FUNGIBLE_POSITION_MANAGER_ABI from "./non-fungible-position-manager-abi.json";

type PoolPosition = {
  nonce: bigint;
  operator: string;
  tokenAddress0: string;
  tokenAddress1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
};

export class NonFungiblePositionService extends GenericContractService {
  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(wagmiConfig, contractAddress, NON_FUNGIBLE_POSITION_MANAGER_ABI as Abi);
  }

  /**
   * Get the pool positions of a user.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param tokenId - The ID of the token
   * @returns Object containing transaction hash if successful
   */
  async positions(
    chainId: number,
    tokenId: string,
  ): Promise<PoolPosition> {
    const positionsArray = await this.readContractMethod(chainId, "positions", [
      tokenId,
    ]) as [bigint, string, string, string, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
  
    // Transform array to object with named properties
    const position: PoolPosition = {
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
  ): Promise<any> {
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

  async decreaseLiquidity(
    chainId: number,
    tokenId: string,
    liquidity: number,
    amount0Min: number,
    amount1Min: number,
    deadline: number,
  ): Promise<any> {
    const txHash = await this.writeContractMethod(chainId, "decreaseLiquidity", [
      tokenId,
      liquidity,
      amount0Min,
      amount1Min,
      deadline,
    ]);

    return txHash;
  }

  async collect(
    chainId: number,
    tokenId: string,
    recipient: Address,
    amount0Max: number,
    amount1Max: number,
  ): Promise<any> {
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
   */
  async balanceOf(chainId: number, owner: Address): Promise<bigint> {
    return await this.readContractMethod(chainId, "balanceOf", [owner]) as bigint;
  }

  /**
   * Get the token ID at a given index of the owner's token list
   */
  async tokenOfOwnerByIndex(chainId: number, owner: Address, index: number): Promise<bigint> {
    return await this.readContractMethod(chainId, "tokenOfOwnerByIndex", [owner, index]) as bigint;
  }

  /**
   * Get all NFT positions owned by an address
   */
  async getAllPositions(chainId: number, owner: Address): Promise<PoolPosition[]> {
    const balance = await this.balanceOf(chainId, owner);
    const positions: PoolPosition[] = [];

    for (let i = 0; i < Number(balance); i++) {
      const tokenId = await this.tokenOfOwnerByIndex(chainId, owner, i);
      const position = await this.positions(chainId, tokenId.toString());
      positions.push(position);
    }

    return positions;
  }
}

export function createNonFungiblePositionService(
  wagmiConfig: Config,
  contractAddress: Address,
): NonFungiblePositionService {
  return new NonFungiblePositionService(wagmiConfig, contractAddress);
}
