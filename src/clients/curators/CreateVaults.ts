// @ts-check

/**
 * CreateVaults
 *
 * Helper functions for creating different types of vaults using the Byzantine Factory
 */

import { ethers, TransactionResponse } from "ethers";
import {
  EigenlayerVault,
  NativeEigenlayerVault,
  SymbioticVault,
  BaseParams,
  NativeParams,
  EigenlayerParams,
  EigenpodParams,
  SymbioticParams,
} from "../../types";

/**
 * Format base parameters to match the contract's expected format
 * @param params Base parameters
 * @returns Formatted parameters
 */
export function formatBaseParams(params: BaseParams) {
  return {
    token: params.token_address,
    roleManager: params.role_manager,
    versionManager: params.role_version_manager,
    depositWhitelistManager: params.role_deposit_whitelist_manager,
    depositLimitManager: params.role_deposit_limit_manager,
    curatorFeeClaimer: params.role_curator_fee_claimer,
    curatorFeeClaimerRoleAdmin: params.role_curator_fee_claimer_admin,
    curatorFee: params.curator_fee,
    depositLimit: params.deposit_limit,
    isDepositLimit: params.is_deposit_limit,
    isPrivateVault: params.is_private,
    isTokenized: params.is_tokenized,
    name: params.name,
    symbol: params.token_symbol,
    metadataURI: params.description || "",
  };
}

/**
 * Format native parameters to match the contract's expected format
 * @param params Native parameters
 * @returns Formatted parameters
 */
export function formatNativeParams(params: NativeParams) {
  return {
    byzVaultParams: formatBaseParams(params.byzVaultParams),
    operatorId: params.operator_id,
    validatorManagers: params.roles_validator_manager,
  };
}

/**
 * Format Eigenlayer parameters to match the contract's expected format
 * @param params Eigenlayer parameters
 * @returns Formatted parameters
 */
export function formatEigenParams(params: EigenlayerParams) {
  // Get the signature and expiry from approver_signature_and_expiry if it exists
  const signature = params.approver_signature_and_expiry?.signature || "0x";
  const expiry = params.approver_signature_and_expiry?.expiry || 0;

  // Get the salt from approver_salt if it exists
  const salt =
    params.approver_salt ||
    "0x0000000000000000000000000000000000000000000000000000000000000000";

  // Implement parameter formatting logic to match contract expectations
  return {
    delegationSetRoleHolder: params.delegation_set_role_holder,
    operator: params.operator,
    approverSignatureAndExpiry: {
      signature: signature,
      expiry: expiry,
    },
    approverSalt: salt,
  };
}

/**
 * Format EigenPod parameters to match the contract's expected format
 * @param params EigenPod parameters
 * @returns Formatted parameters
 */
export function formatEigenPodParams(params: EigenpodParams) {
  return {
    eigenPodOwner: params.eigen_pod_owner,
    proofSubmitter: params.proof_submitter,
  };
}

/**
 * Format Symbiotic parameters to match the contract's expected format
 * @param params Symbiotic parameters
 * @returns Formatted parameters
 */
export function formatSymbioticParams(params: SymbioticParams) {
  return {
    burnerParams: {
      owner: params.role_burner_owner_burner,
      delay: params.burner_delay_settings_applied,
      globalReceiver: params.burner_global_receiver,
      networkReceivers: params.burner_network_receiver || [], // Use provided array or empty array as fallback
      operatorNetworkReceivers: params.burner_operator_network_receiver || [], // Use provided array or empty array as fallback
    },
    vaultParams: {
      owner: params.role_burner_owner_burner, // Assuming this is the vault owner
      version: params.vault_version,
      epochDuration: params.vault_epoch_duration,
    },
    delegatorParams: {
      delegatorType: params.delegator_type,
      hook: params.delegator_hook,
      hookSetRoleHolder: params.role_delegator_set_hook,
      networkLimitSetRoleHolders: params.role_delegator_set_network_limit,
      operatorNetworkLimitOrSharesSetRoleHolders:
        params.role_delegator_set_operator_network_limit,
      operator: params.delegator_operator,
      network: params.delegator_network,
    },
    slasherParams: {
      slasherType: params.slasher_type,
      vetoDuration: params.slasher_veto_duration,
      resolverSetEpochsDelay: params.slasher_number_epoch_to_set_delay,
    },
  };
}

/**
 * Create an Eigenlayer ERC20 vault
 * @param contract Byzantine Factory contract instance
 * @param params Eigenlayer vault parameters
 * @param options Optional transaction options
 * @returns Transaction response
 */
export async function createEigenlayerERC20Vault(
  contract: ethers.Contract,
  params: EigenlayerVault,
  options?: Partial<ethers.TransactionRequest>
): Promise<TransactionResponse> {
  // Format parameters
  const formattedBaseParams = formatBaseParams(params.base);
  const formattedEigenParams = formatEigenParams(params.eigenlayer);

  try {
    // Import gas limits from constants
    const { GAS_LIMITS } = require("../../constants");

    // Define default transaction options
    const defaultOptions = {
      gasLimit: GAS_LIMITS.createEigenERC20Vault,
    };

    // Merge default options with user-provided options (user options take precedence)
    const txOptions = { ...defaultOptions, ...options };

    // Use an explicit function signature to avoid ambiguity
    const functionSignature =
      "createEigenByzVault((address,address,address,address,address,address,address,uint256,uint256,bool,bool,bool,string,string,string),(address,address,(bytes,uint256),bytes32))";

    // Call the contract method to create an Eigenlayer ERC20 vault with explicit function signature
    const tx: TransactionResponse = await contract.getFunction(
      functionSignature
    )(formattedBaseParams, formattedEigenParams, txOptions);

    return tx;
  } catch (error: any) {
    console.error("Error creating Eigenlayer ERC20 vault:", error);

    // More detailed error information
    if (error.code === "CALL_EXCEPTION") {
      console.error("Contract call reverted. This could be due to:");
      console.error("- Incorrect parameter format");
      console.error("- Contract function parameter mismatch");
      console.error("- Insufficient gas");
      console.error("- Contract constraints not met");
    }

    throw error;
  }
}

/**
 * Create an Eigenlayer Native vault
 * @param contract Byzantine Factory contract instance
 * @param params Native Eigenlayer vault parameters
 * @param options Optional transaction options
 * @returns Transaction response
 */
export async function createEigenlayerNativeVault(
  contract: ethers.Contract,
  params: NativeEigenlayerVault,
  options?: Partial<ethers.TransactionRequest>
): Promise<TransactionResponse> {
  // Format parameters
  const nativeByzVaultParams = formatNativeParams(params.base);
  const formattedEigenParams = formatEigenParams(params.eigenlayer);
  const formattedEigenPodParams = formatEigenPodParams(params.eigenpod);

  try {
    // Import gas limits from constants
    const { GAS_LIMITS } = require("../../constants");

    // Define advanced transaction options with a manual gas limit if necessary
    const txOptions = {
      gasLimit: GAS_LIMITS.createEigenNativeVault,
      ...options,
    };

    // Use an explicit function signature to avoid ambiguity
    const functionSignature =
      "createEigenByzVault(((address,address,address,address,address,address,address,uint256,uint256,bool,bool,bool,string,string,string),bytes32,address[]),(address,address,(bytes,uint256),bytes32),(address,address))";

    // Call the contract method to create an Eigenlayer Native vault with explicit function signature
    const tx: TransactionResponse = await contract.getFunction(
      functionSignature
    )(
      nativeByzVaultParams,
      formattedEigenParams,
      formattedEigenPodParams,
      txOptions
    );

    return tx;
  } catch (error: any) {
    console.error("Error creating Eigenlayer Native vault:", error);

    // More detailed error information
    if (error.code === "CALL_EXCEPTION") {
      console.error("Contract call reverted. This could be due to:");
      console.error("- Incorrect parameter format");
      console.error("- Contract function parameter mismatch");
      console.error("- Insufficient gas");
      console.error("- Contract constraints not met");
    }

    throw error;
  }
}

/**
 * Create a Symbiotic ERC20 vault
 * @param contract Byzantine Factory contract instance
 * @param params Symbiotic vault parameters
 * @param options Optional transaction options
 * @returns Transaction response
 */
export async function createSymbioticERC20Vault(
  contract: ethers.Contract,
  params: SymbioticVault,
  options?: Partial<ethers.TransactionRequest>
): Promise<TransactionResponse> {
  // Format parameters
  const formattedBaseParams = formatBaseParams(params.base);
  const formattedSymbioticParams = formatSymbioticParams(params.symbiotic);

  try {
    // Import gas limits from constants
    const { GAS_LIMITS } = require("../../constants");

    // Define transaction options
    const txOptions = {
      gasLimit: GAS_LIMITS.createSymbioticERC20Vault,
      ...options,
    };

    // Use an explicit function signature to avoid ambiguity
    const functionSignature =
      "createSymByzVault((address,address,address,address,address,address,address,uint256,uint256,bool,bool,bool,string,string,string),((address,uint48,address,(address,address)[],(address,address,address)[]),(address,uint64,uint48),(uint8,address,address,address[],address[],address,address),(uint8,uint48,uint256)))";

    // Call with an alternative method that explicitly specifies the function to call
    const tx: TransactionResponse = await contract.getFunction(
      functionSignature
    )(formattedBaseParams, formattedSymbioticParams, txOptions);

    return tx;
  } catch (error: any) {
    console.error("Error creating Symbiotic ERC20 vault:", error);

    // Improve error messages for easier debugging
    if (
      error.code === "UNPREDICTABLE_GAS_LIMIT" ||
      error.message.includes("eth_estimateGas")
    ) {
      console.error("Gas estimation error. This may be due to:");
      console.error("1. Incorrect or invalid parameters");
      console.error("2. Insufficient balance to pay transaction fees");
      console.error("3. Contract issue");
    }

    throw error;
  }
}

/**
 * Create a SuperVault ERC20 vault
 * @param contract Byzantine Factory contract instance
 * @param params SuperVault parameters
 * @param options Optional transaction options
 * @returns Transaction response
 */
export async function createSuperVaultERC20(
  contract: ethers.Contract,
  params: SymbioticVault,
  options?: Partial<ethers.TransactionRequest>
): Promise<TransactionResponse> {
  // SuperVault not yet implemented in the contract
  throw new Error(
    "SuperVault ERC20 creation is not yet available in the contract"
  );
}
