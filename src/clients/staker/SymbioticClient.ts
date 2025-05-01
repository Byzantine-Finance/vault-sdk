import { ethers } from "ethers";
import { SYM_ERC20_ABI, SYM_VAULT_ABI } from "../../constants/abis";

export class SymbioticClient {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  /**
   * Get the ERC20 contract instance
   * @param vaultAddress The address of the ERC20 vault
   * @returns The ERC20 contract instance
   */
  private getByzVaultContract(vaultAddress: string): ethers.Contract {
    return new ethers.Contract(
      vaultAddress,
      SYM_ERC20_ABI,
      this.signer || this.provider
    );
  }

  /**
   * Get the Symbiotic Vault contract instance
   * @param vaultAddress The address of the Symbiotic vault
   * @returns The Vault contract instance
   */
  private async getSymVaultContract(
    byzSymVaultAddress: string
  ): Promise<ethers.Contract> {
    const byzVaultContract = this.getByzVaultContract(byzSymVaultAddress);
    const symVaultAddress = await byzVaultContract.symVault();

    return new ethers.Contract(
      symVaultAddress,
      SYM_VAULT_ABI,
      this.signer || this.provider
    );
  }

  /**
   * Get the epoch at a specific timestamp for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @param timestamp The timestamp to check
   * @returns The epoch number
   */
  async getEpochAt(vaultAddress: string, timestamp: number): Promise<number> {
    const symVaultContract = await this.getSymVaultContract(vaultAddress);
    return await symVaultContract.epochAt(timestamp);
  }

  /**
   * Get the epoch duration for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The epoch duration
   */
  async getEpochDuration(vaultAddress: string): Promise<number> {
    const symVaultContract = await this.getSymVaultContract(vaultAddress);
    return await symVaultContract.epochDuration();
  }

  /**
   * Get the current epoch for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The current epoch number
   */
  async getCurrentEpoch(vaultAddress: string): Promise<number> {
    const symVaultContract = await this.getSymVaultContract(vaultAddress);
    const epoch = await symVaultContract.currentEpoch();
    return Number(epoch);
  }

  /**
   * Get the start timestamp of the current epoch for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The start timestamp of the current epoch
   */
  async getCurrentEpochStart(vaultAddress: string): Promise<number> {
    const symVaultContract = await this.getSymVaultContract(vaultAddress);
    return await symVaultContract.currentEpochStart();
  }

  /**
   * Get the start timestamp of the previous epoch for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The start timestamp of the previous epoch
   */
  async getPreviousEpochStart(vaultAddress: string): Promise<number> {
    const symVaultContract = await this.getSymVaultContract(vaultAddress);
    return await symVaultContract.previousEpochStart();
  }

  /**
   * Get the start timestamp of the next epoch for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The start timestamp of the next epoch
   */
  async getNextEpochStart(vaultAddress: string): Promise<number> {
    const symVaultContract = await this.getSymVaultContract(vaultAddress);
    return await symVaultContract.nextEpochStart();
  }
}
