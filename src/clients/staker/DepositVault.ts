// Get asset of the vault // asset()
// Get the balance of the user in his wallet for the asset of the vault // balanceOf(address addr) in the asset contract
// Get the balance of the user in the vault for the asset of the vault // balanceOf(address addr) in the vault contract
// Get the balance of the vault for the asset of the vault, aka TVL // get the asset first, then balanceOf(address addr) in the asset contract, and if ETH simply use the balance of the vault
//
// Get the allowance of the user in the vault for the asset of the vault // allowance(address owner, address spender) in the asset contract
//
//
// Put the allowance of the user in the vault for the asset of the vault // approve(address spender, uint256 amount) in the asset contract
// Deposit the token of the vault in the vault // deposit(uint256 amount) in the vault contract, check the allowance first if ERC20, then approve if needed, then deposit

import { ethers } from "ethers";
import { ETH_TOKEN_ADDRESS } from "../../constants";
import { erc20Abi } from "viem";

/**
 * Get the underlying asset address of the vault
 * @param vaultContract - The vault contract instance
 * @returns The address of the vault's asset
 */
export async function getVaultAsset(
  vaultContract: ethers.Contract
): Promise<string> {
  return await vaultContract.asset();
}

/**
 * Get the balance of the user's wallet for the vault's asset
 * @param provider - Ethereum provider
 * @param assetAddress - Address of the asset token
 * @param userAddress - Address of the user
 * @returns The user's wallet balance
 */
export async function getUserWalletBalance(
  provider: ethers.Provider,
  assetAddress: string,
  userAddress: string
): Promise<bigint> {
  // Check if asset is native ETH
  if (assetAddress === ETH_TOKEN_ADDRESS) {
    return await provider.getBalance(userAddress);
  } else {
    // For ERC20 tokens
    const tokenContract = new ethers.Contract(assetAddress, erc20Abi, provider);
    return await tokenContract.balanceOf(userAddress);
  }
}

/**
 * Get the balance of the user in the vault
 * @param vaultContract - The vault contract instance
 * @param userAddress - Address of the user
 * @returns The user's vault balance
 */
export async function getUserVaultBalance(
  vaultContract: ethers.Contract,
  userAddress: string
): Promise<bigint> {
  return await vaultContract.balanceOf(userAddress);
}

/**
 * Get the total value locked (TVL) in the vault
 * @param provider - Ethereum provider
 * @param vaultContract - The vault contract instance
 * @returns The total value locked in the vault
 */
export async function getVaultTVL(
  provider: ethers.Provider,
  vaultContract: ethers.Contract
): Promise<bigint> {
  const assetAddress = await vaultContract.asset();
  const vaultAddress = vaultContract.target as string;

  // Check if the vault has an eigenStrategy
  let hasEigenStrategy = false;
  let strategyAddress: string | null = null;

  try {
    // Try to call the eigenStrategy method if it exists
    strategyAddress = await vaultContract.eigenStrategy();
    hasEigenStrategy = !!(
      strategyAddress &&
      strategyAddress !== "0x0000000000000000000000000000000000000000"
    );
  } catch (error) {
    // If the method doesn't exist or fails, assume there's no eigenStrategy
    hasEigenStrategy = false;
    console.log(
      "This vault doesn't have an eigenStrategy method or the call failed"
    );
  }

  // If we have an eigenStrategy, check its balance instead of the vault's balance
  if (hasEigenStrategy && strategyAddress) {
    console.log(
      `Using eigenStrategy at ${strategyAddress} for TVL calculation`
    );

    try {
      // For Eigenlayer vaults, we need to check the deposited shares in the strategy
      const depositedShares = await vaultContract.getDepositedEigenShares(
        strategyAddress
      );
      return depositedShares;
    } catch (error) {
      console.error("Error getting eigenStrategy balance:", error);
      // Fallback to standard TVL calculation
    }
  }

  // Standard TVL calculation for non-Eigenlayer vaults
  // Check if asset is native ETH
  if (assetAddress === ETH_TOKEN_ADDRESS) {
    return await provider.getBalance(vaultAddress);
  } else {
    // For ERC20 tokens
    const tokenContract = new ethers.Contract(assetAddress, erc20Abi, provider);
    return await tokenContract.balanceOf(vaultAddress);
  }
}

/**
 * Get the allowance of the user for the vault
 * @param provider - Ethereum provider
 * @param assetAddress - Address of the asset token
 * @param userAddress - Address of the user
 * @param vaultAddress - Address of the vault
 * @returns The user's allowance for the vault
 */
export async function getUserAllowance(
  provider: ethers.Provider,
  assetAddress: string,
  userAddress: string,
  vaultAddress: string
): Promise<bigint> {
  // If asset is native ETH, there's no allowance concept
  if (assetAddress === ETH_TOKEN_ADDRESS) {
    return BigInt(0);
  }

  const tokenContract = new ethers.Contract(assetAddress, erc20Abi, provider);
  return await tokenContract.allowance(userAddress, vaultAddress);
}

/**
 * Approve the vault to spend user's tokens
 * @param signer - Ethereum signer
 * @param assetAddress - Address of the asset token
 * @param vaultAddress - Address of the vault
 * @param amount - Amount to approve
 * @returns Transaction response
 */
export async function approveVault(
  signer: ethers.Signer,
  assetAddress: string,
  vaultAddress: string,
  amount: bigint
): Promise<ethers.TransactionResponse> {
  if (assetAddress === ETH_TOKEN_ADDRESS) {
    throw new Error("Cannot approve native ETH");
  }

  const tokenContract = new ethers.Contract(assetAddress, erc20Abi, signer);
  return await tokenContract.approve(vaultAddress, amount);
}

/**
 * Deposit assets into the vault
 * @param signer - Ethereum signer
 * @param vaultContract - The vault contract connected to signer
 * @param amount - Amount to deposit
 * @param autoApprove - Whether to automatically approve if needed
 * @returns Transaction response
 */
export async function depositToVault(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  amount: bigint,
  autoApprove: boolean = true
): Promise<ethers.TransactionResponse> {
  const assetAddress = await vaultContract.asset();
  const vaultAddress = vaultContract.target as string;
  const signerAddress = await signer.getAddress();

  // If asset is native ETH
  if (assetAddress === ETH_TOKEN_ADDRESS) {
    return await vaultContract.deposit(amount, signerAddress, {
      value: amount,
    });
  } else {
    // For ERC20 tokens
    if (autoApprove) {
      const tokenContract = new ethers.Contract(assetAddress, erc20Abi, signer);
      const allowance = await tokenContract.allowance(
        signerAddress,
        vaultAddress
      );

      if (allowance < amount) {
        const approveTx = await tokenContract.approve(vaultAddress, amount);
        await approveTx.wait();
      }
    }

    return await vaultContract.deposit(amount, signerAddress);
  }
}
