// Get limit of a vault // depositLimit()
// Get if the vault has a limit // isDepositLimit()
// Get who is the limit manager //
//
// Change the limit of the vault (only for the limit manager) // setDepositLimit (0xbdc8144b)
// Change if the vault has a limit (only for the limit manager) // setIsDepositLimitEnabled (0x5f27d397)
// Change the limit manager (only for the role owner)

import { ethers } from "ethers";
import { callContractMethod, executeContractMethod } from "../../utils";

// Role identifier constants
const ROLE_ID_LIMIT_MANAGER =
  "0x2daae8ba7365f6f763eb697026a620260780c59702069f99d114d184d7a3303b";

/**
 * Get the deposit limit of the vault
 * @param vaultContract - The vault contract instance
 * @returns The deposit limit value
 */
export async function getVaultDepositLimit(
  vaultContract: ethers.Contract
): Promise<bigint> {
  return await callContractMethod<bigint>(vaultContract, "depositLimit");
}

/**
 * Check if the vault has a deposit limit enabled
 * @param vaultContract - The vault contract instance
 * @returns True if the vault has a deposit limit
 */
export async function isDepositLimitEnabled(
  vaultContract: ethers.Contract
): Promise<boolean> {
  return await callContractMethod<boolean>(vaultContract, "isDepositLimit");
}

/**
 * Check if an address is the limit manager
 * @param vaultContract - The vault contract instance
 * @param address - Address to check
 * @returns True if the address is the limit manager
 */
// export async function isLimitManager(
//   vaultContract: ethers.Contract,
//   address: string
// ): Promise<boolean> {
//   return await callContractMethod<boolean>(
//     vaultContract,
//     "hasRole",
//     ROLE_ID_LIMIT_MANAGER,
//     address
//   );
// }

/**
 * Set the deposit limit for the vault
 * @param signer - Ethereum signer (must be the limit manager)
 * @param vaultContract - The vault contract connected to signer
 * @param limit - New deposit limit value
 * @returns Transaction response
 */
export async function setVaultDepositLimit(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  limit: bigint
): Promise<ethers.TransactionResponse> {
  const signerAddress = await signer.getAddress();

  // Verify the signer has the limit manager role
  const isManager = await callContractMethod<boolean>(
    vaultContract,
    "hasRole",
    ROLE_ID_LIMIT_MANAGER,
    signerAddress
  );

  if (!isManager) {
    throw new Error("Signer does not have the limit manager role");
  }

  // Set the deposit limit
  return await executeContractMethod(vaultContract, "setDepositLimit", limit);
}

/**
 * Enable or disable deposit limits for the vault
 * @param signer - Ethereum signer (must be the limit manager)
 * @param vaultContract - The vault contract connected to signer
 * @param enabled - Whether deposit limits should be enabled (true) or disabled (false)
 * @returns Transaction response
 */
export async function setDepositLimitStatus(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  enabled: boolean
): Promise<ethers.TransactionResponse> {
  const signerAddress = await signer.getAddress();

  // Verify the signer has the limit manager role
  const isManager = await callContractMethod<boolean>(
    vaultContract,
    "hasRole",
    ROLE_ID_LIMIT_MANAGER,
    signerAddress
  );

  if (!isManager) {
    throw new Error("Signer does not have the limit manager role");
  }

  // Set deposit limit status
  return await executeContractMethod(
    vaultContract,
    "setIsDepositLimit",
    enabled
  );
}

/**
 * Transfer the limit manager role to a new address
 * @param signer - Ethereum signer (must be the role admin)
 * @param vaultContract - The vault contract connected to signer
 * @param newManagerAddress - Address of the new limit manager
 * @returns Transaction response
 */
export async function transferLimitManagerRole(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  newManagerAddress: string
): Promise<ethers.TransactionResponse> {
  const signerAddress = await signer.getAddress();

  // Get the admin role for limit manager
  const adminRole = await callContractMethod<string>(
    vaultContract,
    "getRoleAdmin",
    ROLE_ID_LIMIT_MANAGER
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
      "Signer does not have the admin role required to transfer limit manager role"
    );
  }

  // Grant the role to the new manager
  return await executeContractMethod(
    vaultContract,
    "grantRole",
    ROLE_ID_LIMIT_MANAGER,
    newManagerAddress
  );
}
