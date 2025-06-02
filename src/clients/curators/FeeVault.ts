// Get fee of a vault
// Get who is the fee manager (s?)
// Get the available fees of a vault (how? waht exactly?)
//
// Change the fee of a vault (only for the fee manager) (is it possible?)
// Claim the fees of tha vault (how?)
// Change the fee manager (only for the role owner)

import { ethers } from "ethers";
import { GAS_LIMITS } from "../../constants";
import { callContractMethod, executeContractMethod } from "../../utils";

// The role ID for the fee manager (curator fee claimer)
// Note: This might need to be updated with the actual role ID
const ROLE_ID_FEE_MANAGER =
  "0x6270edb7c868f86fda4adedba75108201087268ea345934db8bad688e1feb91b";

/**
 * Get the current fee percentage of the vault
 * @param vaultContract - The vault contract instance
 * @returns The current fee percentage (in basis points, e.g. 100 = 1%)
 */
export async function getCuratorFee(
  vaultContract: ethers.Contract
): Promise<bigint> {
  // This function assumes there's a method to get the curator fee
  // The actual method name might differ depending on the implementation
  if (typeof vaultContract.curatorFee === "function") {
    return await callContractMethod<bigint>(vaultContract, "curatorFee");
  } else {
    throw new Error("This vault does not support direct fee access");
  }
}

/**
 * Check if an address is the fee manager
 * @param vaultContract - The vault contract instance
 * @param address - Address to check
 * @returns True if the address is the fee manager
 */
export async function isFeeManager(
  vaultContract: ethers.Contract,
  address: string
): Promise<boolean> {
  return await callContractMethod<boolean>(
    vaultContract,
    "hasRole",
    ROLE_ID_FEE_MANAGER,
    address
  );
}

/**
 * Get the available unclaimed fees for the vault
 * @param vaultContract - The vault contract instance
 * @returns The amount of unclaimed fees
 */
export async function getUnclaimedFees(
  vaultContract: ethers.Contract
): Promise<bigint> {
  // The implementation depends on the specific contract design
  // This is a placeholder that needs to be updated with actual implementation
  if (typeof vaultContract.getUnclaimedFees === "function") {
    return await callContractMethod<bigint>(vaultContract, "getUnclaimedFees");
  } else {
    throw new Error("This vault does not support unclaimed fees query");
  }
}

/**
 * Set the fee percentage for the vault
 * @param signer - Ethereum signer (must be the fee manager)
 * @param vaultContract - The vault contract connected to signer
 * @param newFee - New fee (in basis points, e.g. 100 = 1%)
 * @returns Transaction response
 */
export async function setVaultFeePercentage(
  vaultContract: ethers.Contract,
  newFee: bigint
): Promise<ethers.TransactionResponse> {
  return await executeContractMethod(vaultContract, "setCuratorFee", newFee);
}

/**
 * Claim the accumulated fees from the vault
 * @param signer - Ethereum signer (must be the fee claimer)
 * @param vaultContract - The vault contract connected to signer
 * @returns Transaction response
 */
export async function claimVaultFees(
  vaultContract: ethers.Contract
): Promise<ethers.TransactionResponse> {
  return await executeContractMethod(
    vaultContract,
    "claimCuratorFee (0x22224b37)"
  );
}

/**
 * Transfer the fee manager role to a new address
 * @param signer - Ethereum signer (must be the role admin)
 * @param vaultContract - The vault contract connected to signer
 * @param newManagerAddress - Address of the new fee manager
 * @returns Transaction response
 */
export async function transferFeeManagerRole(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  newManagerAddress: string
): Promise<ethers.TransactionResponse> {
  const signerAddress = await signer.getAddress();

  // Get the admin role for fee manager
  const adminRole = await callContractMethod<string>(
    vaultContract,
    "getRoleAdmin",
    ROLE_ID_FEE_MANAGER
  );

  // Verify the signer has the admin role
  const isAdmin = await callContractMethod<boolean>(
    vaultContract,
    "hasRole",
    adminRole,
    signerAddress
  );

  if (!isAdmin) {
    throw new Error(
      "Signer does not have the admin role required to transfer fee manager role"
    );
  }

  // Grant the role to the new manager
  return await executeContractMethod(
    vaultContract,
    "grantRole",
    ROLE_ID_FEE_MANAGER,
    newManagerAddress,
    { gasLimit: GAS_LIMITS.grantRole }
  );
}
