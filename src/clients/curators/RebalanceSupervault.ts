// Get the ratio of a supervault // getDistributionRatio()
// Get who is the balancer manager (does that exist?)
// Get status of the rebalance (does it make sense?)
// Get the underlying vaults // getUnderlyingVaults()
//
// Change the ratio of a supervault (only for the balancer manager?) // updateDistributionRatio(uint256 _symRatio)
// Change the role manager (only for the role owner, does it exists?) // setBalancerManager(address newBalancerManager)
// Force the rebalance of the supervault // rebalance()

import { ethers } from "ethers";
import { GAS_LIMITS } from "../../constants";
import { callContractMethod, executeContractMethod } from "../../utils";

// The role ID for the balancer manager (if applicable)
// Note: This is a placeholder and needs to be confirmed
const ROLE_ID_BALANCER_MANAGER =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Get the distribution ratio of the supervault
 * @param supervaultContract - The supervault contract instance
 * @returns The current distribution ratio
 */
export async function getDistributionRatio(
  supervaultContract: ethers.Contract
): Promise<bigint> {
  // This assumes there's a method to get the distribution ratio
  if (typeof supervaultContract.getDistributionRatio === "function") {
    return await callContractMethod<bigint>(
      supervaultContract,
      "getDistributionRatio"
    );
  } else {
    throw new Error(
      "This supervault does not support distribution ratio query"
    );
  }
}

/**
 * Check if an address is the balancer manager
 * @param supervaultContract - The supervault contract instance
 * @param address - Address to check
 * @returns True if the address is the balancer manager
 */
export async function isBalancerManager(
  supervaultContract: ethers.Contract,
  address: string
): Promise<boolean> {
  // This is a placeholder implementation
  // Need to verify if the role exists and what its ID is
  try {
    return await callContractMethod<boolean>(
      supervaultContract,
      "hasRole",
      ROLE_ID_BALANCER_MANAGER,
      address
    );
  } catch (error) {
    throw new Error(
      "Balancer manager role check not supported by this contract"
    );
  }
}

/**
 * Get the current rebalance status of the supervault
 * @param supervaultContract - The supervault contract instance
 * @returns The rebalance status information (implementation dependent)
 */
export async function getRebalanceStatus(
  supervaultContract: ethers.Contract
): Promise<any> {
  // This is a placeholder implementation
  // The actual method and return type depends on the implementation
  if (typeof supervaultContract.getRebalanceStatus === "function") {
    return await callContractMethod<any>(
      supervaultContract,
      "getRebalanceStatus"
    );
  } else {
    throw new Error("This supervault does not support rebalance status query");
  }
}

/**
 * Get the underlying vaults of the supervault
 * @param supervaultContract - The supervault contract instance
 * @returns Array of underlying vault addresses
 */
export async function getUnderlyingVaults(
  supervaultContract: ethers.Contract
): Promise<string[]> {
  // This assumes there's a method to get the underlying vaults
  if (typeof supervaultContract.getUnderlyingVaults === "function") {
    return await callContractMethod<string[]>(
      supervaultContract,
      "getUnderlyingVaults"
    );
  } else {
    throw new Error("This supervault does not support underlying vaults query");
  }
}

/**
 * Update the distribution ratio of the supervault
 * @param signer - Ethereum signer (must be the balancer manager)
 * @param supervaultContract - The supervault contract connected to signer
 * @param ratio - New distribution ratio
 * @returns Transaction response
 */
export async function updateDistributionRatio(
  signer: ethers.Signer,
  supervaultContract: ethers.Contract,
  ratio: bigint
): Promise<ethers.TransactionResponse> {
  // This assumes there's a method to update the distribution ratio
  // and that the signer has the correct permissions
  if (typeof supervaultContract.updateDistributionRatio === "function") {
    return await executeContractMethod(
      supervaultContract,
      "updateDistributionRatio",
      ratio,
      { gasLimit: GAS_LIMITS.setDepositLimit }
    );
  } else {
    throw new Error(
      "This supervault does not support distribution ratio updates"
    );
  }
}

/**
 * Set a new balancer manager
 * @param signer - Ethereum signer (must be the role admin)
 * @param supervaultContract - The supervault contract connected to signer
 * @param newManagerAddress - Address of the new balancer manager
 * @returns Transaction response
 */
export async function setBalancerManager(
  signer: ethers.Signer,
  supervaultContract: ethers.Contract,
  newManagerAddress: string
): Promise<ethers.TransactionResponse> {
  // This is a placeholder implementation
  // Need to verify if this functionality exists
  if (typeof supervaultContract.setBalancerManager === "function") {
    return await executeContractMethod(
      supervaultContract,
      "setBalancerManager",
      newManagerAddress,
      { gasLimit: GAS_LIMITS.grantRole }
    );
  } else {
    // Alternative: try using role-based access control if available
    try {
      const adminRole = await callContractMethod<string>(
        supervaultContract,
        "getRoleAdmin",
        ROLE_ID_BALANCER_MANAGER
      );

      const signerAddress = await signer.getAddress();

      // Verify the signer has the admin role
      const isAdmin = await callContractMethod<boolean>(
        supervaultContract,
        "hasRole",
        adminRole,
        signerAddress
      );

      if (!isAdmin) {
        throw new Error(
          "Signer does not have the admin role required to transfer balancer manager role"
        );
      }

      // Grant the role to the new manager
      return await executeContractMethod(
        supervaultContract,
        "grantRole",
        ROLE_ID_BALANCER_MANAGER,
        newManagerAddress,
        { gasLimit: GAS_LIMITS.grantRole }
      );
    } catch (error) {
      throw new Error(
        "This supervault does not support changing the balancer manager"
      );
    }
  }
}

/**
 * Force a rebalance of the supervault
 * @param signer - Ethereum signer (permissions vary by implementation)
 * @param supervaultContract - The supervault contract connected to signer
 * @returns Transaction response
 */
export async function forceRebalance(
  signer: ethers.Signer,
  supervaultContract: ethers.Contract
): Promise<ethers.TransactionResponse> {
  // This assumes there's a method to force a rebalance
  if (typeof supervaultContract.rebalance === "function") {
    return await executeContractMethod(supervaultContract, "rebalance", {
      gasLimit: GAS_LIMITS.setDepositLimit * 3,
    });
  } else {
    throw new Error("This supervault does not support forced rebalancing");
  }
}
