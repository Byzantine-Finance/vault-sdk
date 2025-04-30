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
  SuperVault,
} from "../../types";

import { BYZANTINE_FACTORY_ABI } from "../../constants/abis";
import { convertMetadataToURI } from "./MetadataVault";

/**
 * Format base parameters to match the contract's expected format
 * @param params Base parameters
 * @returns Formatted parameters
 */
export async function formatBaseParams(params: BaseParams) {
  let metadataURI;
  if (typeof params.metadata === "string") {
    metadataURI = params.metadata; // If it's already a URI, use it
  } else {
    metadataURI = await convertMetadataToURI(params.metadata); // If it's a Metadata object, convert it to a URI
  }

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
    name: params.token_name,
    symbol: params.token_symbol,
    metadataURI: metadataURI,
  };
}

/**
 * Format native parameters to match the contract's expected format
 * @param params Native parameters
 * @returns Formatted parameters
 */
export async function formatNativeParams(params: NativeParams) {
  return {
    byzVaultParams: await formatBaseParams(params.byzVaultParams),
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
  const formattedBaseParams = await formatBaseParams(params.base);
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
  const nativeByzVaultParams = await formatNativeParams(params.base);
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
      "createEigenByzVault(((address,address,address,address,address,address,address,uint256,uint256,bool,bool,bool,string,string,string),bytes32,address[]),(address,address,(bytes,uint256),bytes32),(address))";

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
  const formattedBaseParams = await formatBaseParams(params.base);
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
      "createSymByzVault((address,address,address,address,address,address,address,uint256,uint256,bool,bool,bool,string,string,string),((address,uint48,address,(address,address)[],(address,address,address)[]),(uint64,uint48),(uint8,address,address,address[],address[],address,address),(uint8,uint48,uint256)))";

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
  params: SuperVault,
  options?: Partial<ethers.TransactionRequest>
): Promise<TransactionResponse> {
  // Format parameters
  const formattedBaseParams = await formatBaseParams(params.base);
  const formattedSymbioticParams = formatSymbioticParams(params.symbiotic);
  const formattedEigenParams = formatEigenParams(params.eigenlayer);

  try {
    // Import gas limits from constants
    const { GAS_LIMITS } = require("../../constants");

    // Define transaction options
    const txOptions = {
      gasLimit: GAS_LIMITS.createSuperVaultERC20,
      ...options,
    };

    // Create the SuperVaultParams structure according to the ABI
    const superVaultParams = {
      byzVaultParams: formattedBaseParams,
      symRatio: params.ratio,
      eigenParams: formattedEigenParams,
      symParams: formattedSymbioticParams,
      curator: params.curator,
    };

    console.log("superVaultParams", superVaultParams);

    // Call the contract method directly with the structured params
    const tx = await contract.createSuperERC20Vault(
      superVaultParams,
      txOptions
    );

    return tx;
  } catch (error: any) {
    console.error("Error creating SuperVault ERC20 vault:", error);

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

//
// {
//   type: "function",
//   name: "setTokenToEigenStrategy",
//   inputs: [
//     { name: "_token", type: "address[]", internalType: "contract IERC20[]" },
//     {
//       name: "_strategy",
//       type: "address[]",
//       internalType: "contract IStrategy[]",
//     },
//   ],
//   outputs: [],
//   stateMutability: "nonpayable",
// },

/**
 * Set the token to Eigen strategy mapping
 * @param contract Byzantine Factory contract instance
 * @param tokens The array of ERC20 token addresses
 * @param strategies The array of EigenLayer strategy addresses
 * @param options Optional transaction options
 * @returns Transaction response
 */
export async function setTokenToEigenStrategy(
  contract: ethers.Contract,
  tokens: string[],
  strategies: string[],
  options?: Partial<ethers.TransactionRequest>
): Promise<TransactionResponse> {
  try {
    //check if same length
    if (tokens.length !== strategies.length) {
      throw new Error(
        "Tokens and strategies arrays must be of the same length"
      );
    }

    // Import gas limits from constants
    const { GAS_LIMITS } = require("../../constants");

    // Define transaction options
    const txOptions = {
      gasLimit: GAS_LIMITS.setTokenToEigenStrategy,
      ...options,
    };

    // Call the contract method directly with the structured params
    const tx = await contract.setTokenToEigenStrategy(
      tokens,
      strategies,
      txOptions
    );

    return tx;
  } catch (error: any) {
    console.error("Error setting token to Eigen strategy:", error);

    throw error;
  }
}
