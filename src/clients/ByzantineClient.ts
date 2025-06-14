// @ts-check

/**
 * ByzantineClient
 *
 * Client for interacting with the Byzantine contract
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
  RestakingProtocol,
  DelegatorType,
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
  AccessControlClient,
  RoleType,
} from "./curators";

// Import specialized clients
import {
  DepositClient,
  WithdrawClient,
  EigenLayerClient,
  SymbioticClient,
  VaultTypeClient,
} from "./staker";

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

  // Specialized clients
  private depositClient: DepositClient;
  private withdrawClient: WithdrawClient;
  private eigenLayerClient: EigenLayerClient;
  private symbioticClient: SymbioticClient;
  private vaultTypeClient: VaultTypeClient;
  private accessControlClient: AccessControlClient;
  /**
   * Initialize a new ByzantineClient
   * @param options Client configuration options
   */
  constructor(options: ByzantineClientOptions) {
    this.chainId = options.chainId;

    // Get network configuration
    const networkConfig = getNetworkConfig(this.chainId);
    if (!networkConfig) {
      throw new Error(`Unsupported chain ID: ${this.chainId}`);
    }

    this.contractAddress = networkConfig.byzantineFactoryAddress;

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

    // Initialize specialized clients
    this.depositClient = new DepositClient(this.provider, this.signer);
    this.withdrawClient = new WithdrawClient(this.provider, this.signer);
    this.eigenLayerClient = new EigenLayerClient(this.provider, this.signer);
    this.symbioticClient = new SymbioticClient(this.provider, this.signer);
    this.vaultTypeClient = new VaultTypeClient(this.provider);
    this.accessControlClient = new AccessControlClient(
      this.provider,
      this.signer
    );
  }

  // ===========================
  // Create Vaults Functions
  // ===========================

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

  // ===========================
  // Metadata Management
  // ===========================

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
   * @param metadata The new metadata object, or URI
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
   *
   *
   * const tx = await byzantineClient.updateVaultMetadata("0x123...", metadata);
   * await tx.wait();
   */
  async updateVaultMetadata(
    vaultAddress: string,
    metadata: Metadata | string
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.setMetadata(vaultContract, metadata);
  }

  // Fee Management

  /**
   * Get the curator fee of a vault
   * @param vaultAddress The address of the vault
   * @returns The curator fee in basis points, e.g. 1.4% = 140
   */
  async getCuratorFee(vaultAddress: string): Promise<bigint> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.getCuratorFee(vaultContract);
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
   * Set the curator fee for a vault. Max is 10_000 (100%)
   * @param vaultAddress The address of the vault
   * @param newFee The new curator fee in basis points, e.g. 1.4% = 140
   * @returns Transaction response
   */
  async setCuratorFee(
    vaultAddress: string,
    newFee: bigint
  ): Promise<TransactionResponse> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.setVaultFeePercentage(vaultContract, newFee);
  }

  /**
   * Claim the fees from a vault
   * @param vaultAddress The address of the vault
   * @returns Transaction response
   */
  async claimVaultFees(vaultAddress: string): Promise<TransactionResponse> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await curatorFunctions.claimVaultFees(vaultContract);
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

  // ===========================
  // Staker Functions
  // ===========================

  // Deposit Functions

  /**
   * Get the asset address of a vault
   * @param vaultAddress The address of the vault
   * @returns The asset address
   */
  async getVaultAsset(vaultAddress: string): Promise<string> {
    return await this.depositClient.getVaultAsset(vaultAddress);
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
    return await this.depositClient.getUserWalletBalance(
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
    return await this.depositClient.getUserVaultBalance(
      vaultAddress,
      userAddress
    );
  }

  /**
   * Get the total value locked in a vault
   * @param vaultAddress The address of the vault
   * @returns The total value locked
   */
  async getVaultTVL(vaultAddress: string): Promise<bigint> {
    return await this.depositClient.getVaultTVL(vaultAddress);
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
    return await this.depositClient.getUserAllowance(
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
    return await this.depositClient.approveVault(
      assetAddress,
      vaultAddress,
      amount
    );
  }

  /**
   * Deposit assets into a vault
   * @param vaultAddress The address of the vault
   * @param amount The amount to deposit
   * @param autoApprove Whether to automatically approve if needed, false by default
   * @returns Transaction response
   */
  async depositToVault(
    vaultAddress: string,
    amount: bigint,
    autoApprove: boolean = false
  ): Promise<TransactionResponse> {
    return await this.depositClient.depositToVault(
      vaultAddress,
      amount,
      autoApprove
    );
  }

  // Withdraw Functions

  /**
   * Withdraw assets from a vault
   * @param vaultAddress The address of the vault
   * @param amount The amount of assets to withdraw
   * @returns Transaction response
   */
  async withdrawFromVault(
    vaultAddress: string,
    amount: bigint
  ): Promise<TransactionResponse> {
    return await this.withdrawClient.withdrawFromVault(vaultAddress, amount);
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
    return await this.withdrawClient.redeemSharesFromVault(
      vaultAddress,
      shares
    );
  }

  /**
   * Check if a withdrawal request is claimable
   * @param vaultAddress The address of the vault
   * @param requestId The ID of the withdrawal request
   * @returns True if the request is claimable
   */
  async isClaimable(vaultAddress: string, requestId: string): Promise<boolean> {
    return await this.withdrawClient.isClaimable(vaultAddress, requestId);
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
    return await this.withdrawClient.completeWithdrawal(
      vaultAddress,
      requestId
    );
  }

  /**
   * Get a withdrawal request
   * @param vaultAddress The address of the vault
   * @param requestId The ID of the withdrawal request
   * @returns Transaction response
   */
  async getWithdrawalRequest(
    vaultAddress: string,
    requestId: string
  ): Promise<ethers.TransactionResponse> {
    return await this.withdrawClient.getWithdrawalRequest(
      vaultAddress,
      requestId
    );
  }
  // ===========================
  // EigenLayer Functions
  // ===========================

  /**
   * Get the Eigen Operator of a vault
   * @param vaultAddress The address of the vault
   * @returns The Eigen Operator
   */
  async getEigenOperator(vaultAddress: string): Promise<string> {
    return await this.eigenLayerClient.getEigenOperator(vaultAddress);
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
    return await this.eigenLayerClient.setEigenOperator(
      vaultAddress,
      operator,
      approverSignatureAndExpiry,
      approverSalt,
      options
    );
  }

  // ===========================
  // Symbiotic Functions
  // ===========================

  /**
   * Get the epoch at a specific timestamp for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @param timestamp The timestamp to check
   * @returns The epoch number
   */
  async getEpochAt(vaultAddress: string, timestamp: number): Promise<number> {
    return await this.symbioticClient.getEpochAt(vaultAddress, timestamp);
  }

  /**
   * Get the epoch duration for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The epoch duration
   */
  async getEpochDuration(vaultAddress: string): Promise<number> {
    return await this.symbioticClient.getEpochDuration(vaultAddress);
  }

  /**
   * Get the current epoch for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The current epoch number
   */
  async getCurrentEpoch(vaultAddress: string): Promise<number> {
    return await this.symbioticClient.getCurrentEpoch(vaultAddress);
  }

  /**
   * Get the start timestamp of the current epoch for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The start timestamp of the current epoch
   */
  async getCurrentEpochStart(vaultAddress: string): Promise<number> {
    return await this.symbioticClient.getCurrentEpochStart(vaultAddress);
  }

  /**
   * Get the start timestamp of the previous epoch for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The start timestamp of the previous epoch
   */
  async getPreviousEpochStart(vaultAddress: string): Promise<number> {
    try {
      return await this.symbioticClient.getPreviousEpochStart(vaultAddress);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get the start timestamp of the next epoch for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The start timestamp of the next epoch
   */
  async getNextEpochStart(vaultAddress: string): Promise<number> {
    return await this.symbioticClient.getNextEpochStart(vaultAddress);
  }

  /**
   * Get the sym vault address of a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The sym vault address
   */
  async getSymVaultAddress(vaultAddress: string): Promise<string> {
    return await this.symbioticClient.getSymVaultAddress(vaultAddress);
  }
  /**
   * Get the delegator address of a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The delegator address
   */
  async getDelegatorAddress(vaultAddress: string): Promise<string> {
    return await this.symbioticClient.getDelegatorAddress(vaultAddress);
  }

  /**
   * Get the slasher address of a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The slasher address
   */
  async getSlasherAddress(vaultAddress: string): Promise<string> {
    return await this.symbioticClient.getSlasherAddress(vaultAddress);
  }

  /**
   * Get the burner address of a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The burner address
   */
  async getBurnerAddress(vaultAddress: string): Promise<string> {
    return await this.symbioticClient.getBurnerAddress(vaultAddress);
  }

  /**
   * Get the delegator operator for a vault
   * @param vaultAddress The address of the vault
   * @returns The delegator operator
   */
  async getDelegatorOperator(vaultAddress: string): Promise<string> {
    return await this.symbioticClient.getDelegatorOperator(vaultAddress);
  }

  /**
   * Get the delegator network for a vault
   * @param vaultAddress The address of the vault
   * @returns The delegator network
   */
  async getDelegatorNetwork(vaultAddress: string): Promise<string> {
    return await this.symbioticClient.getDelegatorNetwork(vaultAddress);
  }

  /**
   * Get the delegator type of a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The delegator type
   */
  async getDelegatorType(vaultAddress: string): Promise<DelegatorType> {
    return await this.symbioticClient.getDelegatorType(vaultAddress);
  }

  // ===========================
  // Vault Type Functions
  // ===========================

  /**
   * Check if a vault is a Symbiotic vault
   * @param vaultAddress The address of the vault to check
   * @returns True if the vault is a Symbiotic vault, false otherwise
   */
  async isSymbioticVault(vaultAddress: string): Promise<boolean> {
    return await this.vaultTypeClient.isSymbioticVault(vaultAddress);
  }

  /**
   * Check if a vault is an EigenLayer vault
   * @param vaultAddress The address of the vault to check
   * @returns True if the vault is an EigenLayer vault, false otherwise
   */
  async isEigenVault(vaultAddress: string): Promise<boolean> {
    return await this.vaultTypeClient.isEigenVault(vaultAddress);
  }

  /**
   * Check if a vault is a SuperVault
   * @param vaultAddress The address of the vault to check
   * @returns True if the vault is a SuperVault, false otherwise
   */
  async isSupervault(vaultAddress: string): Promise<boolean> {
    return await this.vaultTypeClient.isSupervault(vaultAddress);
  }

  /**
   * Get the type of vault
   * @param vaultAddress The address of the vault to check
   * @returns The type of the vault (Symbiotic, EigenLayer, Supervault), or undefined if unknown
   */
  async getVaultType(
    vaultAddress: string
  ): Promise<RestakingProtocol | undefined> {
    return await this.vaultTypeClient.getVaultType(vaultAddress);
  }

  // ===========================
  // Access Control Functions
  // ===========================

  /**
   * Check if a user has a specific role
   * @param vaultAddress The address of the vault
   * @param roleType The role type
   * @param address The address of the user to check
   * @returns True if the user has the role, false otherwise
   */
  async isManager(
    vaultAddress: string,
    roleType: RoleType,
    address: string
  ): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      roleType,
      address
    );
  }

  /**
   * Set a manager for a vault
   * @param vaultAddress The address of the vault
   * @param roleType The role type
   * @param address The address of the user to set the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response
   */
  async setManager(
    vaultAddress: string,
    roleType: RoleType,
    address: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      roleType,
      address,
      enable
    );
  }

  /**
   * Check if a user has the default admin role
   * @param vaultAddress The address of the vault to check
   * @param userAddress The address of the user to check
   * @returns True if the user has the default admin role
   */
  async isRoleManager(
    vaultAddress: string,
    userAddress: string
  ): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      RoleType.DEFAULT_ADMIN_ROLE,
      userAddress
    );
  }

  /**
   * Grant or revoke the role manager role for a user
   * @param vaultAddress The address of the vault to modify
   * @param userAddress The address of the user to grant/revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   */
  async setRoleManager(
    vaultAddress: string,
    userAddress: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      RoleType.DEFAULT_ADMIN_ROLE,
      userAddress,
      enable
    );
  }

  /**
   * Check if a user has the validators manager role
   * @param vaultAddress The address of the vault to check
   * @param userAddress The address of the user to check
   * @returns True if the user has the validators manager role
   */
  async isValidatorsManager(
    vaultAddress: string,
    userAddress: string
  ): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      RoleType.VALIDATORS_MANAGER,
      userAddress
    );
  }

  /**
   * Grant or revoke the validators manager role for a user
   * @param vaultAddress The address of the vault to modify
   * @param userAddress The address of the user to grant/revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   */
  async setValidatorsManager(
    vaultAddress: string,
    userAddress: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      RoleType.VALIDATORS_MANAGER,
      userAddress,
      enable
    );
  }

  /**
   * Check if a user has the version manager role
   * @param vaultAddress The address of the vault to check
   * @param userAddress The address of the user to check
   * @returns True if the user has the version manager role
   */
  async isVersionManager(
    vaultAddress: string,
    userAddress: string
  ): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      RoleType.VERSION_MANAGER,
      userAddress
    );
  }

  /**
   * Grant or revoke the version manager role for a user
   * @param vaultAddress The address of the vault to modify
   * @param userAddress The address of the user to grant/revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   */
  async setVersionManager(
    vaultAddress: string,
    userAddress: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      RoleType.VERSION_MANAGER,
      userAddress,
      enable
    );
  }

  /**
   * Check if a user has the whitelist manager role
   * @param vaultAddress The address of the vault to check
   * @param userAddress The address of the user to check
   * @returns True if the user has the whitelist manager role
   */
  async isWhitelistManager(
    vaultAddress: string,
    userAddress: string
  ): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      RoleType.WHITELIST_MANAGER,
      userAddress
    );
  }

  /**
   * Grant or revoke the whitelist manager role for a user
   * @param vaultAddress The address of the vault to modify
   * @param userAddress The address of the user to grant/revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   */
  async setWhitelistManager(
    vaultAddress: string,
    userAddress: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      RoleType.WHITELIST_MANAGER,
      userAddress,
      enable
    );
  }

  /**
   * Check if a user has the limit manager role
   * @param vaultAddress The address of the vault to check
   * @param userAddress The address of the user to check
   * @returns True if the user has the limit manager role
   */
  async isLimitManager(
    vaultAddress: string,
    userAddress: string
  ): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      RoleType.LIMIT_MANAGER,
      userAddress
    );
  }

  /**
   * Grant or revoke the limit manager role for a user
   * @param vaultAddress The address of the vault to modify
   * @param userAddress The address of the user to grant/revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   */
  async setLimitManager(
    vaultAddress: string,
    userAddress: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      RoleType.LIMIT_MANAGER,
      userAddress,
      enable
    );
  }

  /**
   * Check if a user has the delegation manager role
   * @param vaultAddress The address of the vault to check
   * @param userAddress The address of the user to check
   * @returns True if the user has the delegation manager role
   */
  async isDelegationManager(
    vaultAddress: string,
    userAddress: string
  ): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      RoleType.DELEGATION_MANAGER,
      userAddress
    );
  }

  /**
   * Grant or revoke the delegation manager role for a user
   * @param vaultAddress The address of the vault to modify
   * @param userAddress The address of the user to grant/revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   */
  async setDelegationManager(
    vaultAddress: string,
    userAddress: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      RoleType.DELEGATION_MANAGER,
      userAddress,
      enable
    );
  }

  /**
   * Check if a user has the operator network shares manager role
   * @param vaultAddress The address of the vault to check
   * @param userAddress The address of the user to check
   * @returns True if the user has the operator network shares manager role
   */
  async isOperatorNetworkSharesManager(
    vaultAddress: string,
    userAddress: string
  ): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      RoleType.OPERATOR_NETWORK_SHARES_SET,
      userAddress
    );
  }

  /**
   * Grant or revoke the operator network shares manager role for a user
   * @param vaultAddress The address of the vault to modify
   * @param userAddress The address of the user to grant/revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   */
  async setOperatorNetworkSharesManager(
    vaultAddress: string,
    userAddress: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      RoleType.OPERATOR_NETWORK_SHARES_SET,
      userAddress,
      enable
    );
  }

  /**
   * Check if a user has the operator network limit manager role
   * @param vaultAddress The address of the vault to check
   * @param userAddress The address of the user to check
   * @returns True if the user has the operator network limit manager role
   */
  async isOperatorNetworkLimitManager(
    vaultAddress: string,
    userAddress: string
  ): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      RoleType.OPERATOR_NETWORK_LIMIT_SET,
      userAddress
    );
  }

  /**
   * Grant or revoke the operator network limit manager role for a user
   * @param vaultAddress The address of the vault to modify
   * @param userAddress The address of the user to grant/revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   */
  async setOperatorNetworkLimitManager(
    vaultAddress: string,
    userAddress: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      RoleType.OPERATOR_NETWORK_LIMIT_SET,
      userAddress,
      enable
    );
  }

  /**
   * Check if a user has the network limit manager role
   * @param vaultAddress The address of the vault to check
   * @param userAddress The address of the user to check
   * @returns True if the user has the network limit manager role
   */
  async isNetworkLimitManager(
    vaultAddress: string,
    userAddress: string
  ): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      RoleType.NETWORK_LIMIT_SET,
      userAddress
    );
  }

  /**
   * Grant or revoke the network limit manager role for a user
   * @param vaultAddress The address of the vault to modify
   * @param userAddress The address of the user to grant/revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   */
  async setNetworkLimitManager(
    vaultAddress: string,
    userAddress: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      RoleType.NETWORK_LIMIT_SET,
      userAddress,
      enable
    );
  }

  /**
   * Check if a user has the curator role
   * @param vaultAddress The address of the vault to check
   * @param userAddress The address of the user to check
   * @returns True if the user has the curator role
   */
  async isCurator(vaultAddress: string, userAddress: string): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      RoleType.CURATOR,
      userAddress
    );
  }

  /**
   * Grant or revoke the curator role for a user
   * @param vaultAddress The address of the vault to modify
   * @param userAddress The address of the user to grant/revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   */
  async setCurator(
    vaultAddress: string,
    userAddress: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      RoleType.CURATOR,
      userAddress,
      enable
    );
  }

  /**
   * Check if a user has the curator fee claimer role
   * @param vaultAddress The address of the vault to check
   * @param userAddress The address of the user to check
   * @returns True if the user has the curator fee claimer role
   */
  async isCuratorFeeClaimer(
    vaultAddress: string,
    userAddress: string
  ): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      RoleType.CURATOR_FEE_CLAIMER,
      userAddress
    );
  }

  /**
   * Grant or revoke the curator fee claimer role for a user
   * @param vaultAddress The address of the vault to modify
   * @param userAddress The address of the user to grant/revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   */
  async setCuratorFeeClaimer(
    vaultAddress: string,
    userAddress: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      RoleType.CURATOR_FEE_CLAIMER,
      userAddress,
      enable
    );
  }

  /**
   * Check if a user has the curator fee claimer admin role
   * @param vaultAddress The address of the vault to check
   * @param userAddress The address of the user to check
   * @returns True if the user has the curator fee claimer admin role
   */
  async isCuratorFeeClaimerAdmin(
    vaultAddress: string,
    userAddress: string
  ): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      RoleType.CURATOR_FEE_CLAIMER_ADMIN,
      userAddress
    );
  }

  /**
   * Grant or revoke the curator fee claimer admin role for a user
   * @param vaultAddress The address of the vault to modify
   * @param userAddress The address of the user to grant/revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   */
  async setCuratorFeeClaimerAdmin(
    vaultAddress: string,
    userAddress: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      RoleType.CURATOR_FEE_CLAIMER_ADMIN,
      userAddress,
      enable
    );
  }

  /**
   * Check if a user has the owner burner role
   * @param vaultAddress The address of the vault to check
   * @param userAddress The address of the user to check
   * @returns True if the user has the owner burner role
   */
  async isOwnerBurner(
    vaultAddress: string,
    userAddress: string
  ): Promise<boolean> {
    return await this.accessControlClient.isManager(
      vaultAddress,
      RoleType.OWNER_BURNER,
      userAddress
    );
  }

  /**
   * Grant or revoke the owner burner role for a user
   * @param vaultAddress The address of the vault to modify
   * @param userAddress The address of the user to grant/revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   */
  async setOwnerBurner(
    vaultAddress: string,
    userAddress: string,
    enable: boolean
  ): Promise<TransactionResponse> {
    return await this.accessControlClient.setManager(
      vaultAddress,
      RoleType.OWNER_BURNER,
      userAddress,
      enable
    );
  }
}
