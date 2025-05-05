import { ethers } from "ethers";
import { ERC20_VAULT_ABI } from "../../constants/abis";
import { ETH_TOKEN_ADDRESS } from "../../constants";
import {} from "ethers";

export class WithdrawClient {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  /**
   * Get the vault contract instance
   * @param vaultAddress The address of the vault
   * @returns The vault contract instance
   */
  private getVaultContract(vaultAddress: string): ethers.Contract {
    return new ethers.Contract(
      vaultAddress,
      ERC20_VAULT_ABI,
      this.signer || this.provider
    );
  }

  /**
   * Get the queued withdrawal requests for a specific staker
   * @param vaultAddress The address of the vault
   * @param stakerAddress Address of the staker
   * @returns Array of withdrawal request IDs
   */
  async getQueuedWithdrawalRequests(
    vaultAddress: string,
    stakerAddress: string
  ): Promise<string[]> {
    // The contract doesn't have a direct method to get queued withdrawal requests
    // This would typically require accessing blockchain events or an indexer
    throw new Error(
      "Function not implemented - requires event querying or indexer"
    );
  }

  /**
   * Check if a withdrawal request is claimable
   * @param vaultAddress The address of the vault
   * @param requestId The ID of the withdrawal request
   * @returns True if the request is claimable
   */
  async isClaimable(vaultAddress: string, requestId: string): Promise<boolean> {
    const vaultContract = this.getVaultContract(vaultAddress);
    try {
      // Use the correct way to call static method in ethers.js v6
      // In v6, we use directly the method with staticCall option
      await vaultContract.completeWithdrawal.staticCall(requestId);

      // If we get here, it means the simulation was successful
      return true;
    } catch (error: any) {
      // The simulation failed, so the transaction would revert
      console.log("Revert reason:", error.revert);
      return false;
    }
  }

  /**
   * Withdraw assets from a vault
   * @param vaultAddress The address of the vault
   * @param amount The amount of assets to withdraw
   * @returns Transaction response
   */
  async withdrawFromVault(
    vaultAddress: string,
    amount: bigint
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    const vaultContract = this.getVaultContract(vaultAddress);
    const signerAddress = await this.signer.getAddress();

    // Call withdraw function with the same address for receiver and owner
    return await vaultContract.withdraw(amount, signerAddress, signerAddress);
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
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    const vaultContract = this.getVaultContract(vaultAddress);
    const signerAddress = await this.signer.getAddress();

    // Call redeem function with the same address for receiver and owner
    return await vaultContract.redeem(shares, signerAddress, signerAddress);
  }

  /**
   * Request withdrawal of native ETH from the vault
   * @param vaultAddress The address of the vault
   * @param assets The amount of assets to withdraw (use 0 for all available)
   * @returns Transaction response
   */
  async requestNativeWithdrawal(
    vaultAddress: string,
    assets: bigint
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    const vaultContract = this.getVaultContract(vaultAddress);
    const signerAddress = await this.signer.getAddress();

    // For native ETH withdrawal, call withdraw but with the assets value
    return await vaultContract.withdraw(assets, signerAddress, signerAddress);
  }

  /**
   * Redeem shares for native ETH from the vault
   * @param vaultAddress The address of the vault
   * @param shares The amount of shares to redeem (use 0 for all available)
   * @returns Transaction response
   */
  async redeemNativeShares(
    vaultAddress: string,
    shares: bigint
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    const vaultContract = this.getVaultContract(vaultAddress);
    const signerAddress = await this.signer.getAddress();

    // For native ETH redemption, call redeem with the shares value
    return await vaultContract.redeem(shares, signerAddress, signerAddress);
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
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    const vaultContract = this.getVaultContract(vaultAddress);
    return await vaultContract.completeWithdrawal(requestId);
  }
}
