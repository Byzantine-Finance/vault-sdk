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

import { ethers } from "ethers";
import {
  ByzantineFactoryClientOptions,
  EigenlayerVault,
  NativeEigenlayerVault,
  SymbioticVault,
} from "../types";
import { getNetworkConfig } from "../utils/network";
import { BYZANTINE_FACTORY_ABI } from "../constants/abis";
import { ETH_TOKEN_ADDRESS } from "../constants";
import { http } from "viem";
import { createPublicClient, PublicClient } from "viem";
import { mainnet } from "viem/chains";

export class ByzantineFactoryClient {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private readonly publicClient?: PublicClient;
  public readonly chainId: number;
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
   * @returns Transaction receipt
   */
  async createEigenlayerERC20Vault(params: EigenlayerVault) {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    // Format parameters
    const formattedBaseParams = this.formatBaseParams(params.base);
    const formattedEigenParams = this.formatEigenParams(params.eigenlayer);

    console.log("Creating Eigenlayer ERC20 vault with parameters:");
    console.log("Base params:", formattedBaseParams);
    console.log("Eigen params:", formattedEigenParams);

    try {
      // Utiliser une signature explicite de fonction pour éviter l'ambiguïté
      const functionSignature =
        "createEigenByzVault((address,address,address,address,address,address,address,uint256,uint256,bool,bool,bool,string,string,string),(address,address,(bytes,uint256),bytes32))";

      // Call the contract method to create an Eigenlayer ERC20 vault with explicit function signature
      const tx = await this.contract.getFunction(functionSignature)(
        formattedBaseParams,
        formattedEigenParams
      );

      console.log("Transaction sent, waiting for confirmation...");
      console.log("Transaction hash:", tx.hash);

      return await tx.wait();
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
   * @returns Transaction receipt
   */
  async createEigenlayerNativeVault(params: NativeEigenlayerVault) {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    // Get signer address for default values
    const signerAddress = await this.signer.getAddress();

    // Use the provided structure directly which should already match the contract's expected format
    const nativeByzVaultParams = {
      byzVaultParams: this.formatBaseParams({
        ...params.base.byzVaultParams,
        token_address: ETH_TOKEN_ADDRESS, // Ensure ETH address is set for native vault
      }),
      operatorId: params.base.operator_id,
      validatorManagers: params.base.roles_validator_manager,
    };

    console.log("Creating Eigenlayer Native vault with parameters:", params);
    console.log("NativeByzVaultParams:", nativeByzVaultParams);

    const formattedEigenParams = this.formatEigenParams(params.eigenlayer);
    const formattedEigenPodParams = this.formatEigenPodParams(params.eigenpod);

    console.log("Formatted EigenParams:", formattedEigenParams);
    console.log("Formatted EigenPodParams:", formattedEigenPodParams);
    // Utiliser une signature explicite de fonction pour éviter l'ambiguïté
    const functionSignature =
      "createEigenByzVault(((address,address,address,address,address,address,address,uint256,uint256,bool,bool,bool,string,string,string),bytes32,address[]),(address,address,(bytes,uint256),bytes32),(address,address))";

    try {
      // Call the contract method to create an Eigenlayer Native vault with explicit function signature
      const tx = await this.contract.getFunction(functionSignature)(
        nativeByzVaultParams,
        formattedEigenParams,
        formattedEigenPodParams
      );

      console.log("Transaction sent, waiting for confirmation...");
      return await tx.wait();
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
   * @returns Transaction receipt
   */
  async createSymbioticERC20Vault(params: SymbioticVault) {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    // Format parameters
    const formattedBaseParams = this.formatBaseParams(params.base);
    const formattedSymbioticParams = this.formatSymbioticParams(
      params.symbiotic
    );

    console.log("Creating Symbiotic ERC20 vault with parameters:");
    console.log("Base params:", formattedBaseParams);
    console.log("Symbiotic params:", formattedSymbioticParams);

    try {
      // Utiliser une signature explicite de fonction pour éviter l'ambiguïté
      const functionSignature =
        "createSymByzVault((address,address,address,address,address,address,address,uint256,uint256,bool,bool,bool,string,string,string),((address,uint48,address,(address,address)[],(address,address,address)[]),(address,uint64,uint48),(uint8,address,address,address[],address[],address,address),(uint8,uint48,uint256)))";

      // Appel avec une méthode alternative qui spécifie explicitement la fonction à appeler
      const tx = await this.contract.getFunction(functionSignature)(
        formattedBaseParams,
        formattedSymbioticParams
      );

      console.log("Transaction sent, waiting for confirmation...");
      console.log("Transaction hash:", tx.hash);

      return await tx.wait();
    } catch (error: any) {
      console.error("Error creating Symbiotic ERC20 vault:", error);

      // Amélioration des messages d'erreur pour faciliter le débogage
      if (
        error.code === "UNPREDICTABLE_GAS_LIMIT" ||
        error.message.includes("eth_estimateGas")
      ) {
        console.error("Erreur d'estimation de gaz. Cela peut être dû à:");
        console.error("1. Paramètres incorrects ou invalides");
        console.error(
          "2. Solde insuffisant pour payer les frais de transaction"
        );
        console.error("3. Problème dans le contrat lui-même");

        // Vérifier les soldes si possible
        try {
          const address = await this.signer.getAddress();
          const balance = await this.provider.getBalance(address);
          console.log(
            `Solde du compte ${address}: ${ethers.formatEther(balance)} ETH`
          );
        } catch (balanceError) {
          console.error("Impossible de vérifier le solde:", balanceError);
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
   * @returns Transaction receipt
   */
  async createSuperVaultERC20(params: SymbioticVault) {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    // SuperVault not yet implemented in the contract
    throw new Error(
      "SuperVault ERC20 creation is not yet available in the contract"
    );

    // Placeholder for future implementation
    // const tx = await this.contract.createSuperVaultERC20(params);
    // return await tx.wait();
  }

  /**
   * Format base parameters to match the contract's expected format
   * @param params Base parameters
   * @returns Formatted parameters
   */
  private formatBaseParams(params: any) {
    console.log("Formatting base params:", params);
    // Implement parameter formatting logic to match contract expectations
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
   * Format Eigenlayer parameters to match the contract's expected format
   * @param params Eigenlayer parameters
   * @returns Formatted parameters
   */
  private formatEigenParams(params: any) {
    console.log("Formatting eigen params:", params);
    // Ensure operator is properly formatted as bytes32
    let operatorId = params.operator || params.operator_id;
    if (operatorId && !operatorId.startsWith("0x")) {
      operatorId = "0x" + operatorId;
    }

    // If operatorId is a hex string shorter than 66 chars (0x + 64 hex chars), pad it
    // if (operatorId && operatorId.startsWith("0x") && operatorId.length < 66) {
    //   operatorId = operatorId.padEnd(66, "0");
    // }

    // Get the signature and expiry from approver_signature_and_expiry if it exists
    const signature = params.approver_signature_and_expiry?.signature || "0x";
    const expiry = params.approver_signature_and_expiry?.expiry || 0;

    // Get the salt from approver_salt if it exists
    const salt =
      params.approver_salt ||
      "0x0000000000000000000000000000000000000000000000000000000000000000";

    // Implement parameter formatting logic to match contract expectations
    return {
      delegationSetRoleHolder:
        params.delegation_set_role_holder || params.role_validator_manager,
      operator: operatorId,
      approverSignatureAndExpiry: {
        signature: signature,
        expiry: expiry,
      },
      approverSalt: salt,
    };
  }

  /**
   * Format Symbiotic parameters to match the contract's expected format
   * @param params Symbiotic parameters
   * @returns Formatted parameters
   */
  private formatSymbioticParams(params: any) {
    // Format parameters to match the SymParams structure in the contract
    console.log("Raw symbiotic params:", params);

    // Make sure enum values are converted to numbers
    const delegatorType =
      typeof params.delegator_type === "number"
        ? params.delegator_type
        : parseInt(params.delegator_type.toString());

    const slasherType =
      typeof params.slasher_type === "number"
        ? params.slasher_type
        : parseInt(params.slasher_type.toString());

    console.log("Delegator type:", delegatorType, "Slasher type:", slasherType);

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
        delegatorType: delegatorType,
        hook: params.delegator_hook,
        hookSetRoleHolder: params.role_delegator_set_hook,
        networkLimitSetRoleHolders: params.role_delegator_set_network_limit,
        operatorNetworkLimitOrSharesSetRoleHolders:
          params.role_delegator_set_operator_network_limit,
        operator: params.delegator_operator,
        network: params.delegator_network,
      },
      slasherParams: {
        slasherType: slasherType,
        vetoDuration: params.slasher_veto_duration,
        resolverSetEpochsDelay: params.slasher_number_epoch_to_set_delay,
      },
    };
  }

  /**
   * Format EigenPod parameters to match the contract's expected format
   * @param params EigenPod parameters
   * @returns Formatted parameters
   */
  private formatEigenPodParams(params: any) {
    console.log("Formatting eigen pod params:", params);
    return {
      eigenPodOwner: params.eigen_pod_owner,
      proofSubmitter: params.proof_submitter,
    };
  }
}
