// @ts-check

/**
 * ByzantineFactoryClient
 *
 * Client for interacting with the Byzantine Factory contract
 * Provides methods to create different types of vaults:
 * - Eigenlayer ERC20 vaults
 * - Eigenlayer Native vaults
 * - Symbiotic ERC20 vaults
 * - SuperVault ERC20 vaults
 */

import { ethers, TransactionResponse } from "ethers";
import {
  ByzantineFactoryClientOptions,
  EigenlayerVault,
  NativeEigenlayerVault,
  SymbioticVault,
  ChainsOptions,
  BaseParams,
  NativeParams,
  EigenlayerParams,
  EigenpodParams,
  SymbioticParams,
} from "../types";
import { getNetworkConfig, isChainSupported } from "../constants/networks";
import { BYZANTINE_FACTORY_ABI } from "../constants/abis";
import { ETH_TOKEN_ADDRESS } from "../constants";
import { http, TransactionReceipt, TransactionRequest } from "viem";
import { createPublicClient, PublicClient } from "viem";
import { mainnet } from "viem/chains";

export class ByzantineFactoryClient {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private readonly publicClient?: PublicClient;
  public readonly chainId: ChainsOptions;
  public readonly contractAddress: string;
  private contract: ethers.Contract;

  /**
   * Initialize a new ByzantineFactoryClient
   * @param options Client configuration options
   */
  constructor(options: ByzantineFactoryClientOptions) {
    this.chainId = options.chainId;

    // Get network configuration
    const networkConfig = getNetworkConfig(this.chainId);
    if (!networkConfig) {
      throw new Error(`Unsupported chain ID: ${this.chainId}`);
    }

    this.contractAddress = networkConfig.factoryContractAddress;

    // Set up provider and signer
    if (options.provider) {
      this.provider = options.provider;

      if (options.signer) {
        this.signer = options.signer;
      }
    } else {
      throw new Error("Provider is required");
    }

    // Initialize contract instance
    this.contract = new ethers.Contract(
      this.contractAddress,
      BYZANTINE_FACTORY_ABI,
      this.signer || this.provider
    );

    // Set up viem clients if not using ethers
    if (!this.provider && !this.signer) {
      //&& !this.config
      this.publicClient = createPublicClient({
        chain: mainnet,
        transport: http(),
      });
    }
  }

  /**
   * Create an Eigenlayer ERC20 vault
   * @param params The vault parameters
   * @param options Optional transaction options to override defaults
   * @returns Transaction response
   */
  async createEigenlayerERC20Vault(
    params: EigenlayerVault,
    options?: Partial<ethers.TransactionRequest>
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    // Format parameters
    const formattedBaseParams = this.formatBaseParams(params.base);
    const formattedEigenParams = this.formatEigenParams(params.eigenlayer);

    try {
      // Import gas limits from constants
      const { GAS_LIMITS } = require("../constants");

      // Get block information to determine gas limit
      const block = await this.provider.getBlock("latest");
      const blockGasLimit = block?.gasLimit || BigInt(0);
      // console.log("Current block gas limit:", blockGasLimit.toString());

      // Set a safe gas limit that is below block gas limit
      // Use 80% of block gas limit or the default gas limit, whichever is lower
      const recommendedGasLimit = Math.min(
        Number(blockGasLimit) * 0.8,
        GAS_LIMITS.createEigenNativeVault
      );

      // console.log("Recommended gas limit:", recommendedGasLimit);

      // Define default transaction options
      const defaultOptions = {
        gasLimit: Math.floor(recommendedGasLimit),
      };

      // Merge default options with user-provided options (user options take precedence)
      const txOptions = { ...defaultOptions, ...options };

      // Use an explicit function signature to avoid ambiguity
      const functionSignature =
        "createEigenByzVault((address,address,address,address,address,address,address,uint256,uint256,bool,bool,bool,string,string,string),(address,address,(bytes,uint256),bytes32))";

      // Call the contract method to create an Eigenlayer ERC20 vault with explicit function signature
      const tx: TransactionResponse = await this.contract.getFunction(
        functionSignature
      )(formattedBaseParams, formattedEigenParams, txOptions);

      // console.log("Transaction sent, waiting for confirmation...");
      // console.log("Transaction hash:", tx.hash);

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
   * @param params The vault parameters
   * @param options Optional transaction options to override defaults
   * @returns Transaction response
   */
  async createEigenlayerNativeVault(
    params: NativeEigenlayerVault,
    options?: Partial<ethers.TransactionRequest>
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    // Format parameters
    const nativeByzVaultParams = this.formatNativeParams(params.base);
    const formattedEigenParams = this.formatEigenParams(params.eigenlayer);
    const formattedEigenPodParams = this.formatEigenPodParams(params.eigenpod);

    try {
      // Import gas limits from constants
      const { GAS_LIMITS } = require("../constants");

      // Get block information to determine gas limit
      const block = await this.provider.getBlock("latest");
      const blockGasLimit = block?.gasLimit || BigInt(0);
      // console.log("Current block gas limit:", blockGasLimit.toString());

      // Set a safe gas limit that is below block gas limit
      // Use 80% of block gas limit or the default gas limit, whichever is lower
      const recommendedGasLimit = Math.min(
        Number(blockGasLimit) * 0.8,
        GAS_LIMITS.createEigenNativeVault
      );

      // console.log("Recommended gas limit:", recommendedGasLimit);

      // Define advanced transaction options with a manual gas limit if necessary
      const options = {
        gasLimit: Math.floor(recommendedGasLimit),
      };

      // Use an explicit function signature to avoid ambiguity
      const functionSignature =
        "createEigenByzVault(((address,address,address,address,address,address,address,uint256,uint256,bool,bool,bool,string,string,string),bytes32,address[]),(address,address,(bytes,uint256),bytes32),(address,address))";

      // Call the contract method to create an Eigenlayer Native vault with explicit function signature
      const tx: TransactionResponse = await this.contract.getFunction(
        functionSignature
      )(
        nativeByzVaultParams,
        formattedEigenParams,
        formattedEigenPodParams,
        options
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
   * @param params The vault parameters
   * @param options Optional transaction options to override defaults
   * @returns Transaction response
   */
  async createSymbioticERC20Vault(
    params: SymbioticVault,
    options?: Partial<ethers.TransactionRequest>
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    // Format parameters
    const formattedBaseParams = this.formatBaseParams(params.base);
    const formattedSymbioticParams = this.formatSymbioticParams(
      params.symbiotic
    );

    console.log("Going to create symbiotic vault");
    console.log("Formatted base params:", formattedBaseParams);
    console.log("Formatted symbiotic params:", formattedSymbioticParams);

    try {
      // Use an explicit function signature to avoid ambiguity
      const functionSignature =
        "createSymByzVault((address,address,address,address,address,address,address,uint256,uint256,bool,bool,bool,string,string,string),((address,uint48,address,(address,address)[],(address,address,address)[]),(address,uint64,uint48),(uint8,address,address,address[],address[],address,address),(uint8,uint48,uint256)))";

      // Call with an alternative method that explicitly specifies the function to call
      const tx: TransactionResponse = await this.contract.getFunction(
        functionSignature
      )(formattedBaseParams, formattedSymbioticParams, options ?? {});

      // console.log("Transaction sent, waiting for confirmation...");
      // console.log("Transaction hash:", tx.hash);

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

        // Check balances if possible
        try {
          const address = await this.signer.getAddress();
          const balance = await this.provider.getBalance(address);
          console.log(
            `Balance of account ${address}: ${ethers.formatEther(balance)} ETH`
          );
        } catch (balanceError) {
          console.error("Unable to check balance:", balanceError);
        }
      }

      console.error(
        "Function signatures available:",
        Object.keys(this.contract.interface.fragments)
          .filter((f) => f.includes("createSymByzVault"))
          .join("\n")
      );

      throw error;
    }
  }

  /**
   * Create a SuperVault ERC20 vault
   * @param params The vault parameters
   * @param options Optional transaction options to override defaults
   * @returns Transaction response
   */
  async createSuperVaultERC20(
    params: SymbioticVault,
    options?: Partial<ethers.TransactionRequest>
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    // SuperVault not yet implemented in the contract
    throw new Error(
      "SuperVault ERC20 creation is not yet available in the contract"
    );
  }

  /**
   * Format base parameters to match the contract's expected format
   * @param params Base parameters
   * @returns Formatted parameters
   */
  private formatBaseParams(params: BaseParams) {
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
  private formatNativeParams(params: NativeParams) {
    return {
      byzVaultParams: this.formatBaseParams(params.byzVaultParams),
      operatorId: params.operator_id,
      validatorManagers: params.roles_validator_manager,
    };
  }

  /**
   * Format Eigenlayer parameters to match the contract's expected format
   * @param params Eigenlayer parameters
   * @returns Formatted parameters
   */
  private formatEigenParams(params: EigenlayerParams) {
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
  private formatEigenPodParams(params: EigenpodParams) {
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
  private formatSymbioticParams(params: SymbioticParams) {
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
}
