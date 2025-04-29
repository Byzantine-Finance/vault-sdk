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
  ByzantineClientOptions,
  EigenlayerVault,
  NativeEigenlayerVault,
  SymbioticVault,
  SuperVault,
  ChainsOptions,
  Metadata,
} from "../types";
import { getNetworkConfig } from "../constants/networks";
import { BYZANTINE_FACTORY_ABI, ERC20_VAULT_ABI } from "../constants/abis";
import { PublicClient } from "viem";
import { createPublicClient } from "viem";
import { http } from "viem";
import { mainnet } from "viem/chains";

// Import vault creator functions
import {
  createEigenlayerERC20Vault,
  createEigenlayerNativeVault,
  createSymbioticERC20Vault,
  createSuperVaultERC20,
  setTokenToEigenStrategy,
} from "./curators";

// Import staker functions
import * as stakerFunctions from "./staker";

// Import curator functions
import * as curatorFunctions from "./curators";

// Import shares vault functions
import * as sharesVaultFunctions from "./curators/SharesVault";

export class ByzantineClient {
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
  constructor(options: ByzantineClientOptions) {
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

    return createEigenlayerERC20Vault(this.contract, params, options);
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

    return createEigenlayerNativeVault(this.contract, params, options);
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

    return createSymbioticERC20Vault(this.contract, params, options);
  }

  /**
   * Create a SuperVault ERC20 vault
   * @param params The vault parameters
   * @param options Optional transaction options to override defaults
   * @returns Transaction response
   */
  async createSuperVaultERC20(
    params: SuperVault,
    options?: Partial<ethers.TransactionRequest>
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    return createSuperVaultERC20(this.contract, params, options);
  }

  /**
   * Set the token to Eigen strategy mapping
   * @param tokens The array of ERC20 token addresses
   * @param strategies The array of EigenLayer strategy addresses
   * @param options Optional transaction options
   * @returns Transaction response
   */
  async setTokenToEigenStrategy(
    tokens: string[],
    strategies: string[],
    options?: Partial<ethers.TransactionRequest>
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    return setTokenToEigenStrategy(this.contract, tokens, strategies, options);
  }

  /**
   * Get a vault contract instance
   * @param vaultAddress The address of the vault
   * @returns Vault contract instance
   */
  getVaultContract(vaultAddress: string): ethers.Contract {
    return new ethers.Contract(
      vaultAddress,
      ERC20_VAULT_ABI,
      this.signer || this.provider
    );
  }

  // ===========================
  // Staker Functions
  // ===========================

  /**
   * Get the asset address of a vault
   * @param vaultAddress The address of the vault
   * @returns The asset address
   */
  async getVaultAsset(vaultAddress: string): Promise<string> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await stakerFunctions.getVaultAsset(vaultContract);
  }

  /**
   * Get the balance of assets in a user's wallet
   * @param assetAddress The address of the asset
   * @param userAddress The address of the user
   * @returns The user's wallet balance
   */
  async getUserWalletBalance(
    assetAddress: string,
    userAddress: string
  ): Promise<bigint> {
    return await stakerFunctions.getUserWalletBalance(
      this.provider,
      assetAddress,
      userAddress
    );
  }

  /**
   * Get the balance of a user in a vault
   * @param vaultAddress The address of the vault
   * @param userAddress The address of the user
   * @returns The user's vault balance
   */
  async getUserVaultBalance(
    vaultAddress: string,
    userAddress: string
  ): Promise<bigint> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await stakerFunctions.getUserVaultBalance(
      vaultContract,
      userAddress
    );
  }

  /**
   * Get the total value locked in a vault
   * @param vaultAddress The address of the vault
   * @returns The total value locked
   */
  async getVaultTVL(vaultAddress: string): Promise<bigint> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await stakerFunctions.getVaultTVL(this.provider, vaultContract);
  }

  /**
   * Get the allowance of a user for a vault
   * @param assetAddress The address of the asset
   * @param userAddress The address of the user
   * @param vaultAddress The address of the vault
   * @returns The user's allowance
   */
  async getUserAllowance(
    assetAddress: string,
    userAddress: string,
    vaultAddress: string
  ): Promise<bigint> {
    return await stakerFunctions.getUserAllowance(
      this.provider,
      assetAddress,
      userAddress,
      vaultAddress
    );
  }

  /**
   * Approve a vault to spend user's tokens
   * @param assetAddress The address of the asset
   * @param vaultAddress The address of the vault
   * @param amount The amount to approve
   * @returns Transaction response
   */
  async approveVault(
    assetAddress: string,
    vaultAddress: string,
    amount: bigint
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    return await stakerFunctions.approveVault(
      this.signer,
      assetAddress,
      vaultAddress,
      amount
    );
  }

  /**
   * Deposit assets into a vault
   * @param vaultAddress The address of the vault
   * @param amount The amount to deposit
   * @param autoApprove Whether to automatically approve if needed
   * @returns Transaction response
   */
  async depositToVault(
    vaultAddress: string,
    amount: bigint,
    autoApprove: boolean = true
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const vaultContract = this.getVaultContract(vaultAddress);
    return await stakerFunctions.depositToVault(
      this.signer,
      vaultContract,
      amount,
      autoApprove
    );
  }

  /**
   * Withdraw assets from a vault
   * @param vaultAddress The address of the vault
   * @param assets The amount of assets to withdraw
   * @returns Transaction response
   */
  async withdrawFromVault(
    vaultAddress: string,
    assets: bigint
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const vaultContract = this.getVaultContract(vaultAddress);
    return await stakerFunctions.withdrawFromVault(
      this.signer,
      vaultContract,
      assets
    );
  }

  /**
   * Redeem shares from a vault
   * @param vaultAddress The address of the vault
   * @param shares The amount of shares to redeem
   * @returns Transaction response
   */
  async redeemSharesFromVault(
    vaultAddress: string,
    shares: bigint
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const vaultContract = this.getVaultContract(vaultAddress);
    return await stakerFunctions.redeemSharesFromVault(
      this.signer,
      vaultContract,
      shares
    );
  }

  /**
   * Complete a withdrawal request
   * @param vaultAddress The address of the vault
   * @param requestId The ID of the withdrawal request
   * @returns Transaction response
   */
  async completeWithdrawal(
    vaultAddress: string,
    requestId: string
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const vaultContract = this.getVaultContract(vaultAddress);
    return await stakerFunctions.completeWithdrawal(
      this.signer,
      vaultContract,
      requestId
    );
  }

  // ===========================
  // Curator Functions
  // ===========================

  // Whitelist Management

  /**
   * Check if an address is whitelisted for a vault
   * @param vaultAddress The address of the vault
   * @param address The address to check
   * @returns True if the address is whitelisted
   */
  async isAddressWhitelisted(
    vaultAddress: string,
    address: string
  ): Promise<boolean> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.isAddressWhitelisted(vaultContract, address);
  }

  /**
   * Check if a vault is private
   * @param vaultAddress The address of the vault
   * @returns True if the vault is private
   */
  async isVaultPrivate(vaultAddress: string): Promise<boolean> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.isVaultPrivate(vaultContract);
  }

  /**
   * Set whitelist status for multiple addresses
   * @param vaultAddress The address of the vault
   * @param addresses The addresses to update
   * @param canDeposit Whether the addresses can deposit
   * @returns Transaction response
   */
  async setAddressesWhitelistStatus(
    vaultAddress: string,
    addresses: string[],
    canDeposit: boolean
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.setAddressesWhitelistStatus(
      this.signer,
      vaultContract,
      addresses,
      canDeposit
    );
  }

  /**
   * Set the private status of a vault
   * @param vaultAddress The address of the vault
   * @param isPrivate Whether the vault should be private
   * @returns Transaction response
   */
  async setVaultPrivateStatus(
    vaultAddress: string,
    isPrivate: boolean
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.setVaultPrivateStatus(
      this.signer,
      vaultContract,
      isPrivate
    );
  }

  // Deposit Limit Management

  /**
   * Get the deposit limit of a vault
   * @param vaultAddress The address of the vault
   * @returns The deposit limit
   */
  async getVaultDepositLimit(vaultAddress: string): Promise<bigint> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.getVaultDepositLimit(vaultContract);
  }

  /**
   * Check if a vault has a deposit limit enabled
   * @param vaultAddress The address of the vault
   * @returns True if the vault has a deposit limit
   */
  async isDepositLimitEnabled(vaultAddress: string): Promise<boolean> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.isDepositLimitEnabled(vaultContract);
  }

  /**
   * Set the deposit limit for a vault
   * @param vaultAddress The address of the vault
   * @param limit The new deposit limit
   * @returns Transaction response
   */
  async setVaultDepositLimit(
    vaultAddress: string,
    limit: bigint
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.setVaultDepositLimit(
      this.signer,
      vaultContract,
      limit
    );
  }

  /**
   * Enable or disable deposit limits for a vault
   * @param vaultAddress The address of the vault
   * @param enabled Whether deposit limits should be enabled
   * @returns Transaction response
   */
  async setDepositLimitStatus(
    vaultAddress: string,
    enabled: boolean
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.setDepositLimitStatus(
      this.signer,
      vaultContract,
      enabled
    );
  }

  // EigenLayer Functions

  /**
   * Get the Eigen Operator of a vault
   * @param vaultAddress The address of the vault
   * @returns The Eigen Operator
   */
  async getEigenOperator(vaultAddress: string): Promise<string> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await stakerFunctions.getEigenOperator(vaultContract);
  }

  /**
   * Set the Eigen Operator of a vault
   * @param vaultAddress The address of the vault
   * @param operator The new Eigen Operator
   * @param approverSignatureAndExpiry The signature and expiry for the approver
   * @param approverSalt The salt for the approver
   * @param options Optional transaction parameters like gas limit, gas price, etc.
   * @returns Transaction response
   */
  async setEigenOperator(
    vaultAddress: string,
    operator: string,
    approverSignatureAndExpiry: {
      signature: string;
      expiry: number;
    },
    approverSalt: string,
    options?: Partial<ethers.TransactionRequest>
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    const vaultContract = this.getVaultContract(vaultAddress);
    return await stakerFunctions.setEigenOperator(
      this.signer,
      vaultContract,
      operator,
      approverSignatureAndExpiry,
      approverSalt,
      options
    );
  }

  // Metadata Management

  /**
   * Get the metadata of a vault
   * @param vaultAddress The address of the vault
   * @returns The metadata object
   *
   * @example
   * // Get vault metadata
   * const metadata = await byzantineClient.getVaultMetadata("0x123...");
   * console.log(metadata.name); // "My Vault"
   * console.log(metadata.description); // "This is a description of my vault"
   * console.log(metadata.image); // "https://example.com/image.png"
   */
  async getVaultMetadata(vaultAddress: string): Promise<Metadata> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.getVaultMetadata(vaultContract);
  }

  /**
   * Update the metadata of a vault
   * @param vaultAddress The address of the vault
   * @param metadata The new metadata object
   * @returns Transaction response
   *
   * @example
   * // Update vault metadata
   * const metadata = {
   *   name: "My Vault",
   *   description: "An updated description of my vault",
   *   image_url: "https://example.com/new-image.png",
   *   social_twitter: "https://x.com/byzantine_fi",
   *   social_discord: "https://discord.gg/byzantine",
   *   social_telegram: "https://t.me/byzantine",
   *   social_website: "https://byzantine.fi",
   *   social_github: "https://github.com/Byzantine-Finance/",
   * };
   * const tx = await byzantineClient.updateVaultMetadata("0x123...", metadata);
   * await tx.wait();
   */
  async updateVaultMetadata(
    vaultAddress: string,
    metadata: Metadata
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.setMetadata(vaultContract, metadata);
  }

  // Fee Management

  /**
   * Get the fee percentage of a vault
   * @param vaultAddress The address of the vault
   * @returns The fee percentage
   */
  async getVaultFeePercentage(vaultAddress: string): Promise<bigint> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.getVaultFeePercentage(vaultContract);
  }

  /**
   * Get the unclaimed fees of a vault
   * @param vaultAddress The address of the vault
   * @returns The unclaimed fees
   */
  async getUnclaimedFees(vaultAddress: string): Promise<bigint> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.getUnclaimedFees(vaultContract);
  }

  /**
   * Set the fee percentage for a vault
   * @param vaultAddress The address of the vault
   * @param feePercentage The new fee percentage
   * @returns Transaction response
   */
  async setVaultFeePercentage(
    vaultAddress: string,
    feePercentage: bigint
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.setVaultFeePercentage(
      this.signer,
      vaultContract,
      feePercentage
    );
  }

  /**
   * Claim the fees from a vault
   * @param vaultAddress The address of the vault
   * @returns Transaction response
   */
  async claimVaultFees(vaultAddress: string): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.claimVaultFees(this.signer, vaultContract);
  }

  // SuperVault Management

  /**
   * Get the distribution ratio of a supervault
   * @param supervaultAddress The address of the supervault
   * @returns The distribution ratio
   */
  async getDistributionRatio(supervaultAddress: string): Promise<bigint> {
    const supervaultContract = this.getVaultContract(supervaultAddress);
    return await curatorFunctions.getDistributionRatio(supervaultContract);
  }

  /**
   * Get the underlying vaults of a supervault
   * @param supervaultAddress The address of the supervault
   * @returns The underlying vault addresses
   */
  async getUnderlyingVaults(supervaultAddress: string): Promise<string[]> {
    const supervaultContract = this.getVaultContract(supervaultAddress);
    return await curatorFunctions.getUnderlyingVaults(supervaultContract);
  }

  /**
   * Update the distribution ratio of a supervault
   * @param supervaultAddress The address of the supervault
   * @param ratio The new distribution ratio
   * @returns Transaction response
   */
  async updateDistributionRatio(
    supervaultAddress: string,
    ratio: bigint
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const supervaultContract = this.getVaultContract(supervaultAddress);
    return await curatorFunctions.updateDistributionRatio(
      this.signer,
      supervaultContract,
      ratio
    );
  }

  /**
   * Force a rebalance of a supervault
   * @param supervaultAddress The address of the supervault
   * @returns Transaction response
   */
  async forceRebalance(
    supervaultAddress: string
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const supervaultContract = this.getVaultContract(supervaultAddress);
    return await curatorFunctions.forceRebalance(
      this.signer,
      supervaultContract
    );
  }

  // ===========================
  // Shares Functions
  // ===========================

  /**
   * Check if the vault's shares are tokenized
   * @param vaultAddress The address of the vault
   * @returns True if shares can be transferred like ERC20 tokens
   */
  async isSharesTokenized(vaultAddress: string): Promise<boolean> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await sharesVaultFunctions.isTokenized(vaultContract);
  }

  /**
   * Get the name of the vault share token
   * @param vaultAddress The address of the vault
   * @returns The name of the share token
   */
  async getSharesName(vaultAddress: string): Promise<string> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await sharesVaultFunctions.getSharesName(vaultContract);
  }

  /**
   * Get the symbol of the vault share token
   * @param vaultAddress The address of the vault
   * @returns The symbol of the share token
   */
  async getSharesSymbol(vaultAddress: string): Promise<string> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await sharesVaultFunctions.getSharesSymbol(vaultContract);
  }

  /**
   * Get the total supply of vault shares
   * @param vaultAddress The address of the vault
   * @returns The total supply of shares
   */
  async getTotalShares(vaultAddress: string): Promise<bigint> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await sharesVaultFunctions.getTotalShares(vaultContract);
  }

  /**
   * Get the balance of shares for a specific address
   * @param vaultAddress The address of the vault
   * @param userAddress The address to check balance for
   * @returns The balance of shares for the address
   */
  async getSharesBalance(
    vaultAddress: string,
    userAddress: string
  ): Promise<bigint> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await sharesVaultFunctions.getSharesBalance(
      vaultContract,
      userAddress
    );
  }

  /**
   * Convert a given amount of assets to shares
   * @param vaultAddress The address of the vault
   * @param assets The amount of assets to convert
   * @returns The equivalent amount of shares
   */
  async convertToShares(vaultAddress: string, assets: bigint): Promise<bigint> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await sharesVaultFunctions.convertToShares(vaultContract, assets);
  }

  /**
   * Convert a given amount of shares to assets
   * @param vaultAddress The address of the vault
   * @param shares The amount of shares to convert
   * @returns The equivalent amount of assets
   */
  async convertToAssets(vaultAddress: string, shares: bigint): Promise<bigint> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await sharesVaultFunctions.convertToAssets(vaultContract, shares);
  }
}
