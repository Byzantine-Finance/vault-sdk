import { ethers } from "ethers";
import { ERC20_VAULT_ABI } from "../../constants/abis";
import { ETH_TOKEN_ADDRESS } from "../../constants";
import { erc20Abi } from "viem";

export class DepositClient {
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
   * Get the asset address of a vault
   * @param vaultAddress The address of the vault
   * @returns The asset address
   */
  async getVaultAsset(vaultAddress: string): Promise<string> {
    const vaultContract = this.getVaultContract(vaultAddress);
    return await vaultContract.asset();
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
    // Check if asset is native ETH
    if (assetAddress === ETH_TOKEN_ADDRESS) {
      return await this.provider.getBalance(userAddress);
    } else {
      // For ERC20 tokens
      const tokenContract = new ethers.Contract(
        assetAddress,
        erc20Abi,
        this.provider
      );
      return await tokenContract.balanceOf(userAddress);
    }
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
    return await vaultContract.balanceOf(userAddress);
  }

  /**
   * Get the total value locked in a vault
   * @param vaultAddress The address of the vault
   * @returns The total value locked
   */
  async getVaultTVL(vaultAddress: string): Promise<bigint> {
    const vaultContract = this.getVaultContract(vaultAddress);
    const assetAddress = await vaultContract.asset();
    const vaultAddress2 = vaultContract.target as string;

    // Check if the vault has an eigenStrategy
    let hasEigenStrategy = false;
    let strategyAddress: string | null = null;

    try {
      // Try to call the eigenStrategy method if it exists
      strategyAddress = await vaultContract.eigenStrategy();
      hasEigenStrategy = !!(
        strategyAddress &&
        strategyAddress !== "0x0000000000000000000000000000000000000000"
      );
    } catch (error) {
      // If the method doesn't exist or fails, assume there's no eigenStrategy
      hasEigenStrategy = false;
      console.log(
        "This vault doesn't have an eigenStrategy method or the call failed"
      );
    }

    // If we have an eigenStrategy, check its balance instead of the vault's balance
    if (hasEigenStrategy && strategyAddress) {
      console.log(
        `Using eigenStrategy at ${strategyAddress} for TVL calculation`
      );

      try {
        // For Eigenlayer vaults, we need to check the deposited shares in the strategy
        const depositedShares = await vaultContract.getDepositedEigenShares(
          strategyAddress
        );
        return depositedShares;
      } catch (error) {
        console.error("Error getting eigenStrategy balance:", error);
        // Fallback to standard TVL calculation
      }
    }

    // Standard TVL calculation for non-Eigenlayer vaults
    // Check if asset is native ETH
    if (assetAddress === ETH_TOKEN_ADDRESS) {
      return await this.provider.getBalance(vaultAddress2);
    } else {
      // For ERC20 tokens
      const tokenContract = new ethers.Contract(
        assetAddress,
        erc20Abi,
        this.provider
      );
      return await tokenContract.balanceOf(vaultAddress2);
    }
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
    // If asset is native ETH, there's no allowance concept
    if (assetAddress === ETH_TOKEN_ADDRESS) {
      return BigInt(0);
    }

    const tokenContract = new ethers.Contract(
      assetAddress,
      erc20Abi,
      this.provider
    );
    return await tokenContract.allowance(userAddress, vaultAddress);
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
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    if (assetAddress === ETH_TOKEN_ADDRESS) {
      throw new Error("Cannot approve native ETH");
    }

    const tokenContract = new ethers.Contract(
      assetAddress,
      erc20Abi,
      this.signer
    );
    return await tokenContract.approve(vaultAddress, amount);
  }

  /**
   * Deposit assets into a vault
   * @param vaultAddress The address of the vault
   * @param amount The amount to deposit
   * @param autoApprove Whether to automatically approve if needed, true by default
   * @returns Transaction response
   */
  async depositToVault(
    vaultAddress: string,
    amount: bigint,
    autoApprove: boolean = true
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    const vaultContract = this.getVaultContract(vaultAddress);
    const assetAddress = await vaultContract.asset();
    const signerAddress = await this.signer.getAddress();

    // If asset is native ETH
    if (assetAddress === ETH_TOKEN_ADDRESS) {
      return await vaultContract.deposit(amount, signerAddress, {
        value: amount,
      });
    } else {
      // For ERC20 tokens
      if (autoApprove) {
        const tokenContract = new ethers.Contract(
          assetAddress,
          erc20Abi,
          this.signer
        );
        const allowance = await tokenContract.allowance(
          signerAddress,
          vaultAddress
        );

        if (allowance < amount) {
          const approveTx = await tokenContract.approve(vaultAddress, amount);
          await approveTx.wait();
        }
      }

      return await vaultContract.deposit(amount, signerAddress);
    }
  }
}
