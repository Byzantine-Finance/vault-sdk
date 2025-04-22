// Use all gets from DepositVault if needed
//
// Get withdrawal requests of a staker // getQueuedWithdrawalRequests(address staker), return array

// For ERC20
// Withdraw from the vault // withdraw(uint256 assets, address receiver, address owner), put the same address for receiver and owner
// Redeem from the vault // redeem(uint256 shares, address receiver, address owner), put the same address for receiver and owner
//
// For ETH
// Request withdrawal // withdraw(uint256 assets, address receiver, address owner), put the same address for receiver and owner, and assets = 0xeee
// Redeem from the vault // redeem(uint256 shares, address receiver, address owner), put the same address for receiver and owner, and shares = 0xeee
// Complete withdrawal // completeWithdrawal(bytes32 requestId)

import { ethers } from "ethers";
import { ETH_TOKEN_ADDRESS } from "../../constants";
import { ERC20_VAULT_ABI } from "../../constants/abis";

/**
 * Get the queued withdrawal requests for a specific staker
 * @param vaultContract - The vault contract instance
 * @param stakerAddress - Address of the staker
 * @returns Array of withdrawal request IDs
 */
export async function getQueuedWithdrawalRequests(
  vaultContract: ethers.Contract,
  stakerAddress: string
): Promise<string[]> {
  // The contract doesn't have a direct method to get queued withdrawal requests
  // This would typically require accessing blockchain events or an indexer
  throw new Error(
    "Function not implemented - requires event querying or indexer"
  );
}

/**
 * Withdraw assets from the vault in exchange for shares
 * @param signer - Ethereum signer
 * @param vaultContract - The vault contract connected to signer
 * @param assets - Amount of assets to withdraw
 * @returns Transaction response
 */
export async function withdrawFromVault(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  assets: bigint
): Promise<ethers.TransactionResponse> {
  const signerAddress = await signer.getAddress();

  // Call withdraw function with the same address for receiver and owner
  return await vaultContract.withdraw(assets, signerAddress, signerAddress);
}

/**
 * Redeem shares from the vault in exchange for assets
 * @param signer - Ethereum signer
 * @param vaultContract - The vault contract connected to signer
 * @param shares - Amount of shares to redeem
 * @returns Transaction response
 */
export async function redeemSharesFromVault(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  shares: bigint
): Promise<ethers.TransactionResponse> {
  const signerAddress = await signer.getAddress();

  // Call redeem function with the same address for receiver and owner
  return await vaultContract.redeem(shares, signerAddress, signerAddress);
}

/**
 * Request withdrawal of native ETH from the vault
 * @param signer - Ethereum signer
 * @param vaultContract - The vault contract connected to signer
 * @param assets - Amount of assets to withdraw (use 0 for all available)
 * @returns Transaction response
 */
export async function requestNativeWithdrawal(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  assets: bigint
): Promise<ethers.TransactionResponse> {
  const signerAddress = await signer.getAddress();

  // For native ETH withdrawal, call withdraw but with the assets value
  return await vaultContract.withdraw(assets, signerAddress, signerAddress);
}

/**
 * Redeem shares for native ETH from the vault
 * @param signer - Ethereum signer
 * @param vaultContract - The vault contract connected to signer
 * @param shares - Amount of shares to redeem (use 0 for all available)
 * @returns Transaction response
 */
export async function redeemNativeShares(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  shares: bigint
): Promise<ethers.TransactionResponse> {
  const signerAddress = await signer.getAddress();

  // For native ETH redemption, call redeem with the shares value
  return await vaultContract.redeem(shares, signerAddress, signerAddress);
}

/**
 * Complete a pending withdrawal request
 * @param signer - Ethereum signer
 * @param vaultContract - The vault contract connected to signer
 * @param requestId - ID of the withdrawal request to complete
 * @returns Transaction response
 */
export async function completeWithdrawal(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  requestId: string
): Promise<ethers.TransactionResponse> {
  return await vaultContract.completeWithdrawal(requestId);
}
