import { ethers } from "ethers";
import {
  SYM_ERC20_ABI,
  SYM_VAULT_ABI,
  SUPER_ERC20_ABI,
} from "../../constants/abis";
import { VaultTypeClient } from "./VaultType";
import { callContractMethod } from "../../utils";

interface VaultCache {
  isSupervault?: boolean;
  symVaultAddress?: string;
}

export class SymbioticClient {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private vaultTypeClient: VaultTypeClient;
  private vaultCache: Map<string, VaultCache>;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    this.vaultTypeClient = new VaultTypeClient(provider);
    this.vaultCache = new Map();
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
   * Get the SuperVault contract instance
   * @param vaultAddress The address of the SuperVault
   * @returns The SuperVault contract instance
   */
  private getSuperVaultContract(vaultAddress: string): ethers.Contract {
    return new ethers.Contract(
      vaultAddress,
      SUPER_ERC20_ABI,
      this.signer || this.provider
    );
  }

  /**
   * Get the Symbiotic Vault contract instance
   * @param vaultAddress The address of the Symbiotic vault or SuperVault
   * @returns The Vault contract instance
   */
  private async getSymVaultContract(
    vaultAddress: string
  ): Promise<ethers.Contract> {
    // Check if we have cached information for this vault
    let cacheEntry = this.vaultCache.get(vaultAddress);

    if (!cacheEntry) {
      cacheEntry = {};
      this.vaultCache.set(vaultAddress, cacheEntry);
    }

    // If we don't know if it's a SuperVault yet, check it
    if (cacheEntry.isSupervault === undefined) {
      cacheEntry.isSupervault = await this.vaultTypeClient.isSupervault(
        vaultAddress
      );
    }

    let symVaultAdd: string;

    // If we've already determined the symVault address, use it
    if (cacheEntry.symVaultAddress) {
      symVaultAdd = cacheEntry.symVaultAddress;
    } else {
      // Otherwise, retrieve it based on the vault type
      if (cacheEntry.isSupervault) {
        // For SuperVaults, we need to get the symVault from the SuperVault contract
        const superVaultContract = this.getSuperVaultContract(vaultAddress);
        const [symVaultAddress, eigenVaultAddress] = await callContractMethod<
          [string, string]
        >(superVaultContract, "getUnderlyingVaults");
        const byzVaultContract = this.getByzVaultContract(symVaultAddress);
        symVaultAdd = await callContractMethod<string>(
          byzVaultContract,
          "symVault"
        );
      } else {
        // For regular Symbiotic vaults, proceed as before
        const byzVaultContract = this.getByzVaultContract(vaultAddress);
        symVaultAdd = await callContractMethod<string>(
          byzVaultContract,
          "symVault"
        );
      }

      // Cache the result
      cacheEntry.symVaultAddress = symVaultAdd;
    }

    return new ethers.Contract(
      symVaultAdd,
      SYM_VAULT_ABI,
      this.signer || this.provider
    );
  }

  /**
   * Clear the cache for a specific vault or all vaults
   * @param vaultAddress Optional address of the vault to clear from cache
   */
  public clearCache(vaultAddress?: string): void {
    if (vaultAddress) {
      this.vaultCache.delete(vaultAddress);
    } else {
      this.vaultCache.clear();
    }
  }

  /**
   * Get the epoch at a specific timestamp for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @param timestamp The timestamp to check
   * @returns The epoch number
   */
  async getEpochAt(vaultAddress: string, timestamp: number): Promise<number> {
    const symVaultContract = await this.getSymVaultContract(vaultAddress);
    return await callContractMethod<number>(
      symVaultContract,
      "epochAt",
      timestamp
    );
  }

  /**
   * Get the epoch duration for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The epoch duration
   */
  async getEpochDuration(vaultAddress: string): Promise<number> {
    const symVaultContract = await this.getSymVaultContract(vaultAddress);
    return await callContractMethod<number>(symVaultContract, "epochDuration");
  }

  /**
   * Get the current epoch for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The current epoch number
   */
  async getCurrentEpoch(vaultAddress: string): Promise<number> {
    const symVaultContract = await this.getSymVaultContract(vaultAddress);
    const epoch = await callContractMethod<bigint>(
      symVaultContract,
      "currentEpoch"
    );
    return Number(epoch);
  }

  /**
   * Get the start timestamp of the current epoch for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The start timestamp of the current epoch
   */
  async getCurrentEpochStart(vaultAddress: string): Promise<number> {
    const symVaultContract = await this.getSymVaultContract(vaultAddress);
    return await callContractMethod<number>(
      symVaultContract,
      "currentEpochStart"
    );
  }

  /**
   * Get the start timestamp of the previous epoch for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The start timestamp of the previous epoch
   */
  async getPreviousEpochStart(vaultAddress: string): Promise<number> {
    const symVaultContract = await this.getSymVaultContract(vaultAddress);
    return await callContractMethod<number>(
      symVaultContract,
      "previousEpochStart"
    );
  }

  /**
   * Get the start timestamp of the next epoch for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The start timestamp of the next epoch
   */
  async getNextEpochStart(vaultAddress: string): Promise<number> {
    const symVaultContract = await this.getSymVaultContract(vaultAddress);
    return await callContractMethod<number>(symVaultContract, "nextEpochStart");
  }
}
