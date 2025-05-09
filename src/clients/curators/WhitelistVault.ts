// Get list of the whitelisted address of the vault (for later, with the graph)
// Get if a specific address is whitelisted // canDeposit(address addr)
// Get if the vault is private/public // isPrivateVault()
// Get the whitelist manager

// Change a whitelist of multiple addresses // setCanDeposit(address[] calldata _stakers, bool _canDeposit)
// Change if the vault is private/public // setIsPrivateVault (bool _isPrivateVault)
// Change the whitelist manager (only for the role owner)

import { ethers } from "ethers";
import { GAS_LIMITS } from "../../constants";
import { callContractMethod, executeContractMethod } from "../../utils";

// Role identifier constants
const ROLE_ID_WHITELIST_MANAGER =
  "0x2ca4bff3f985a19d8e4391cdb6bb4ba90be6978dbd55d28447c299e24c9c0617";

/**
 * Check if an address is whitelisted to deposit in the vault
 * @param vaultContract - The vault contract instance
 * @param address - Address to check
 * @returns True if the address is whitelisted
 */
export async function isAddressWhitelisted(
  vaultContract: ethers.Contract,
  address: string
): Promise<boolean> {
  return await callContractMethod<boolean>(
    vaultContract,
    "canDeposit",
    address
  );
}

/**
 * Check if the vault is private
 * @param vaultContract - The vault contract instance
 * @returns True if the vault is private
 */
export async function isVaultPrivate(
  vaultContract: ethers.Contract
): Promise<boolean> {
  return await callContractMethod<boolean>(vaultContract, "isPrivateVault");
}

/**
 * Check if an address is the whitelist manager
 * @param vaultContract - The vault contract instance
 * @param address - Address to check
 * @returns True if the address is the whitelist manager
 */
export async function isWhitelistManager(
  vaultContract: ethers.Contract,
  address: string
): Promise<boolean> {
  return await callContractMethod<boolean>(
    vaultContract,
    "hasRole",
    ROLE_ID_WHITELIST_MANAGER,
    address
  );
}

/**
 * Set whitelist status for multiple addresses
 * @param signer - Ethereum signer (must be the whitelist manager)
 * @param vaultContract - The vault contract connected to signer
 * @param addresses - Array of addresses to whitelist or remove from whitelist
 * @param canDeposit - Whether the addresses can deposit (true) or not (false)
 * @returns Transaction response
 */
export async function setAddressesWhitelistStatus(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  addresses: string[],
  canDeposit: boolean
): Promise<ethers.TransactionResponse> {
  const signerAddress = await signer.getAddress();

  // Verify the signer has the whitelist manager role
  const isManager = await callContractMethod<boolean>(
    vaultContract,
    "hasRole",
    ROLE_ID_WHITELIST_MANAGER,
    signerAddress
  );

  if (!isManager) {
    throw new Error("Signer does not have the whitelist manager role");
  }

  // Set whitelist status for the provided addresses
  return await executeContractMethod(
    vaultContract,
    "setCanDeposit",
    addresses,
    canDeposit,
    { gasLimit: GAS_LIMITS.setDepositWhitelistedStatus }
  );
}

/**
 * Set the private status of the vault
 * @param signer - Ethereum signer (must be the whitelist manager)
 * @param vaultContract - The vault contract connected to signer
 * @param isPrivate - Whether the vault should be private (true) or public (false)
 * @returns Transaction response
 */
export async function setVaultPrivateStatus(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  isPrivate: boolean
): Promise<ethers.TransactionResponse> {
  const signerAddress = await signer.getAddress();

  // Verify the signer has the whitelist manager role
  const isManager = await callContractMethod<boolean>(
    vaultContract,
    "hasRole",
    ROLE_ID_WHITELIST_MANAGER,
    signerAddress
  );

  if (!isManager) {
    throw new Error("Signer does not have the whitelist manager role");
  }

  // Set private status
  return await executeContractMethod(
    vaultContract,
    "setIsPrivateVault",
    isPrivate,
    { gasLimit: GAS_LIMITS.setIsPrivateVault }
  );
}

/**
 * Transfer the whitelist manager role to a new address
 * @param signer - Ethereum signer (must be the role admin)
 * @param vaultContract - The vault contract connected to signer
 * @param newManagerAddress - Address of the new whitelist manager
 * @returns Transaction response
 */
export async function transferWhitelistManagerRole(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  newManagerAddress: string
): Promise<ethers.TransactionResponse> {
  const signerAddress = await signer.getAddress();

  // Get the admin role for whitelist manager
  const adminRole = await callContractMethod<string>(
    vaultContract,
    "getRoleAdmin",
    ROLE_ID_WHITELIST_MANAGER
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
      "Signer does not have the admin role required to transfer whitelist manager role"
    );
  }

  // Grant the role to the new manager
  return await executeContractMethod(
    vaultContract,
    "grantRole",
    ROLE_ID_WHITELIST_MANAGER,
    newManagerAddress,
    { gasLimit: GAS_LIMITS.grantRole }
  );
}
