import { ethers } from "ethers";
import {
  ERC20_VAULT_ABI,
  SYM_ERC20_ABI,
  SUPER_ERC20_ABI,
} from "../../constants/abis";
import { RestakingProtocol } from "../../types";

export class VaultTypeClient {
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider) {
    this.provider = provider;
  }

  /**
   * Get the ERC20 contract instance
   * @param vaultAddress The address of the vault
   * @returns The ERC20 contract instance
   */
  private getContractWithSymABI(vaultAddress: string): ethers.Contract {
    return new ethers.Contract(vaultAddress, SYM_ERC20_ABI, this.provider);
  }

  /**
   * Get the ERC20 contract instance with EigenLayer ABI
   * @param vaultAddress The address of the vault
   * @returns The ERC20 contract instance
   */
  private getContractWithEigenABI(vaultAddress: string): ethers.Contract {
    return new ethers.Contract(vaultAddress, ERC20_VAULT_ABI, this.provider);
  }

  /**
   * Get the ERC20 contract instance with SuperVault ABI
   * @param vaultAddress The address of the vault
   * @returns The ERC20 contract instance
   */
  private getContractWithSuperABI(vaultAddress: string): ethers.Contract {
    return new ethers.Contract(vaultAddress, SUPER_ERC20_ABI, this.provider);
  }

  /**
   * Check if a vault is a Symbiotic vault
   * @param vaultAddress The address of the vault to check
   * @returns True if the vault is a Symbiotic vault, false otherwise
   */
  async isSymbioticVault(vaultAddress: string): Promise<boolean> {
    try {
      const vaultContract = this.getContractWithSymABI(vaultAddress);
      // Try to access the symVault property, which only exists on Symbiotic vaults
      await vaultContract.symVault();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a vault is an EigenLayer vault
   * @param vaultAddress The address of the vault to check
   * @returns True if the vault is an EigenLayer vault, false otherwise
   */
  async isEigenVault(vaultAddress: string): Promise<boolean> {
    try {
      const vaultContract = this.getContractWithEigenABI(vaultAddress);
      // Try to access delegatedTo which only exists on EigenLayer vaults
      await vaultContract.delegatedTo();
      return true;
    } catch (error) {
      // If that failed, try another EigenLayer-specific method
      try {
        const vaultContract = this.getContractWithEigenABI(vaultAddress);
        await vaultContract.eigenStrategy();
        return true;
      } catch (innerError) {
        return false;
      }
    }
  }

  /**
   * Check if a vault is a SuperVault
   * SuperVaults may have properties of both Symbiotic and EigenLayer vaults
   * @param vaultAddress The address of the vault to check
   * @returns True if the vault is a SuperVault, false otherwise
   */
  async isSupervault(vaultAddress: string): Promise<boolean> {
    try {
      const vaultContract = this.getContractWithSuperABI(vaultAddress);
      // Check for SuperVault specific properties
      const underlyingVaults = await vaultContract.getDistributionRatio();
      return Array.isArray(underlyingVaults) && underlyingVaults.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the type of vault
   * @param vaultAddress The address of the vault to check
   * @returns The type of the vault as defined in RestakingProtocol
   */
  async getVaultType(
    vaultAddress: string
  ): Promise<RestakingProtocol | undefined> {
    const isSymbiotic = await this.isSymbioticVault(vaultAddress);
    if (isSymbiotic) return "Symbiotic";

    const isEigen = await this.isEigenVault(vaultAddress);
    if (isEigen) return "EigenLayer";

    const isSuper = await this.isSupervault(vaultAddress);
    if (isSuper) return "Supervault";

    return undefined; // Default fallback, though this is unexpected
  }
}
