// Get the metadata of the vault // metadata()

// Change the metadata of the vault // updateMetadataURI (string metadataURI), use pinata to store the metadata

import { ethers } from "ethers";
import { GAS_LIMITS } from "../../constants";

/**
 * Get the metadata URI of the vault
 * @param vaultContract - The vault contract instance
 * @returns The metadata URI string
 */
export async function getVaultMetadataURI(
  vaultContract: ethers.Contract
): Promise<string> {
  // The contract may not have a direct method to get the metadata URI
  // We need to check the specific implementation
  if (typeof vaultContract.metadataURI === "function") {
    return await vaultContract.metadataURI();
  } else {
    throw new Error("This vault does not support direct metadataURI access");
  }
}

/**
 * Update the metadata URI of the vault
 * @param signer - Ethereum signer (must have the appropriate permissions)
 * @param vaultContract - The vault contract connected to signer
 * @param metadataURI - The new metadata URI (typically an IPFS URL or similar)
 * @returns Transaction response
 */
export async function updateVaultMetadataURI(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  metadataURI: string
): Promise<ethers.TransactionResponse> {
  // Update the metadata URI
  // Note: This assumes the caller has checked permissions beforehand
  return await vaultContract.updateMetadataURI(metadataURI, {
    gasLimit: GAS_LIMITS.setDepositLimit, // using a standard gas limit as reference
  });
}
