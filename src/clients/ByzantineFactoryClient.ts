/**
 * ByzantineFactoryClient
 *
 * Client for interacting with the Byzantine Factory contract
 * Provides methods to create different types of vaults:
 * - EigenLayer ERC20 vaults
 * - EigenLayer Native vaults
 * - Symbiotic ERC20 vaults
 * - SuperVault ERC20 vaults
 */

import { ethers } from "ethers";
import {
  ByzantineFactoryClientOptions,
  EigenLayerVault,
  NativeEigenLayerVault,
  SymbioticVault,
  NativeSymbioticVault,
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
   * Create an EigenLayer ERC20 vault
   * @param params The vault parameters
   * @returns Transaction receipt
   */
  async createEigenLayerERC20Vault(params: EigenLayerVault) {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    // Format parameters
    const formattedBaseParams = this.formatBaseParams(params.base);
    const formattedEigenParams = this.formatEigenParams(params.eigenlayer);

    console.log("Creating EigenLayer ERC20 vault with parameters:");
    console.log("Base params:", formattedBaseParams);
    console.log("Eigen params:", formattedEigenParams);

    try {
      // Call the contract method to create an EigenLayer ERC20 vault
      // Directly call the contract method without using an explicit signature
      const tx = await this.contract.createEigenByzVault(
        formattedBaseParams,
        formattedEigenParams
      );

      console.log("Transaction sent, waiting for confirmation...");
      console.log("Transaction hash:", tx.hash);

      return await tx.wait();
    } catch (error: any) {
      console.error("Error creating EigenLayer ERC20 vault:", error);

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
   * Create an EigenLayer Native vault
   * @param params The vault parameters
   * @returns Transaction receipt
   */
  async createEigenLayerNativeVault(params: NativeEigenLayerVault) {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    // Get signer address first
    const signerAddress = await this.signer.getAddress();

    // Format native vault parameters
    const nativeByzVaultParams = {
      byzVaultParams: this.formatBaseParams({
        ...params.eigenlayer,
        token_address: ETH_TOKEN_ADDRESS,
      }),
      operatorId: params.base.operator_id,
      validatorManagers: params.base.roles_validator_manager,
    };

    // Format EigenPod parameters (required for native vaults)
    const eigenPodParams = {
      eigenPodOwner: signerAddress,
      proofSubmitter: signerAddress,
    };

    // Call the contract method to create an EigenLayer Native vault
    // Using createEigenByzVault with Native parameters (needs 3 params)
    const tx = await this.contract.createEigenByzVault(
      nativeByzVaultParams,
      this.formatEigenParams({
        ...params.eigenlayer,
        operator_id: params.base.operator_id,
      }),
      eigenPodParams
    );

    console.log("Transaction sent, waiting for confirmation...");
    return await tx.wait();
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
      // Import gas limits from constants
      const { GAS_LIMITS } = require("../constants");

      // Get block information to determine gas limit
      const block = await this.provider.getBlock("latest");
      const blockGasLimit = block?.gasLimit || BigInt(0);
      console.log("Current block gas limit:", blockGasLimit.toString());

      // Set a safe gas limit that is below block gas limit
      // Use 80% of block gas limit or the default gas limit, whichever is lower
      const recommendedGasLimit = Math.min(
        Number(blockGasLimit) * 0.8,
        GAS_LIMITS.createSymbioticERC20Vault
      );

      console.log("Recommended gas limit:", recommendedGasLimit);

      // Utiliser une signature explicite de fonction pour éviter l'ambiguïté
      const functionSignature =
        "createSymByzVault((address,address,address,address,address,address,address,uint256,uint256,bool,bool,bool,string,string,string),((address,uint48,address,(address,address)[],(address,address,address)[]),(address,uint64,uint48),(uint8,address,address,address[],address[],address,address),(uint8,uint48,uint256)))";

      // Définir des options de transaction avancées avec un gas limit manuel si nécessaire
      const options = {
        gasLimit: Math.floor(recommendedGasLimit),
      };

      try {
        // Tenter d'abord d'estimer le gaz pour vérifier si la transaction peut réussir
        const gasEstimate = await this.contract
          .getFunction(functionSignature)
          .estimateGas(formattedBaseParams, formattedSymbioticParams);

        console.log("Gas estimate successful:", gasEstimate.toString());
        // Si l'estimation réussit, utiliser cette valeur + marge de sécurité (20% de plus)
        options.gasLimit = (Number(gasEstimate) * 12) / 10; // +20% de marge
      } catch (estimateError: any) {
        console.warn(
          "Gas estimation failed, using default gas limit. Error:",
          estimateError.message
        );

        // Vérifier si l'erreur est liée à une réversion du contrat
        if (estimateError.message.includes("execution reverted")) {
          console.error(
            "Contract execution would revert. Details:",
            estimateError
          );

          // Extraire et afficher la raison de la réversion si disponible
          const revertReason = estimateError.message.match(/reason="([^"]+)"/);
          if (revertReason && revertReason[1]) {
            throw new Error(`Contract would revert: ${revertReason[1]}`);
          }

          throw new Error(
            "Contract execution would revert. Please check your parameters."
          );
        }
      }

      // Appel avec une méthode alternative qui spécifie explicitement la fonction à appeler
      const tx = await this.contract.getFunction(functionSignature)(
        formattedBaseParams,
        formattedSymbioticParams,
        options
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
   * Format EigenLayer parameters to match the contract's expected format
   * @param params EigenLayer parameters
   * @returns Formatted parameters
   */
  private formatEigenParams(params: any) {
    console.log("Formatting eigen params:", params);
    // Ensure operator_id is properly formatted as bytes32
    let operatorId = params.operator_id;
    if (operatorId && !operatorId.startsWith("0x")) {
      operatorId = "0x" + operatorId;
    }

    // If operatorId is a hex string shorter than 66 chars (0x + 64 hex chars), pad it
    // if (operatorId && operatorId.startsWith("0x") && operatorId.length < 66) {
    //   operatorId = operatorId.padEnd(66, "0");
    // }

    // Implement parameter formatting logic to match contract expectations
    return {
      delegationSetRoleHolder: params.role_validator_manager,
      operator: operatorId,
      approverSignatureAndExpiry: {
        signature: "0x",
        expiry: 0,
      }, // Null value because optional
      approverSalt:
        "0x0000000000000000000000000000000000000000000000000000000000000000", // Null value because optional
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
}
