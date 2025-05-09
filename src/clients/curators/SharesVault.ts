// Functions for interacting with vault share information
// Get isTokenized - Whether the vault's shares can be transferred like ERC20 tokens
// Get name - The name of the vault share token
// Get symbol - The symbol of the vault share token

import { ethers } from "ethers";
import { callContractMethod } from "../../utils";

/**
 * Check if the vault's shares are tokenized (transferable like ERC20)
 * @param vaultContract - The vault contract instance
 * @returns True if the vault's shares are tokenized
 */
export async function isTokenized(
  vaultContract: ethers.Contract
): Promise<boolean> {
  return await callContractMethod<boolean>(vaultContract, "isTokenized");
}

/**
 * Get the name of the vault share token
 * @param vaultContract - The vault contract instance
 * @returns The name of the vault share token
 */
export async function getSharesName(
  vaultContract: ethers.Contract
): Promise<string> {
  return await callContractMethod<string>(vaultContract, "name");
}

/**
 * Get the symbol of the vault share token
 * @param vaultContract - The vault contract instance
 * @returns The symbol of the vault share token
 */
export async function getSharesSymbol(
  vaultContract: ethers.Contract
): Promise<string> {
  return await callContractMethod<string>(vaultContract, "symbol");
}

/**
 * Get the total supply of vault shares
 * @param vaultContract - The vault contract instance
 * @returns The total supply of shares
 */
export async function getTotalShares(
  vaultContract: ethers.Contract
): Promise<bigint> {
  return await callContractMethod<bigint>(vaultContract, "totalSupply");
}

/**
 * Get the balance of shares for a specific address
 * @param vaultContract - The vault contract instance
 * @param address - The address to check
 * @returns The balance of shares for the address
 */
export async function getSharesBalance(
  vaultContract: ethers.Contract,
  address: string
): Promise<bigint> {
  return await callContractMethod<bigint>(vaultContract, "balanceOf", address);
}

/**
 * Convert a given amount of assets to shares
 * @param vaultContract - The vault contract instance
 * @param assets - The amount of assets to convert
 * @returns The equivalent amount of shares
 */
export async function convertToShares(
  vaultContract: ethers.Contract,
  assets: bigint
): Promise<bigint> {
  return await callContractMethod<bigint>(
    vaultContract,
    "convertToShares",
    assets
  );
}

/**
 * Convert a given amount of shares to assets
 * @param vaultContract - The vault contract instance
 * @param shares - The amount of shares to convert
 * @returns The equivalent amount of assets
 */
export async function convertToAssets(
  vaultContract: ethers.Contract,
  shares: bigint
): Promise<bigint> {
  return await callContractMethod<bigint>(
    vaultContract,
    "convertToAssets",
    shares
  );
}
