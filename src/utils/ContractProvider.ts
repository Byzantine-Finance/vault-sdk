import { ethers } from "ethers";
import { VaultTypeClient } from "../clients/staker/VaultType";
import {
  SYM_ERC20_ABI,
  SYM_VAULT_ABI,
  SUPER_ERC20_ABI,
  DELEGATOR_ABI,
  BURNER_ABI,
} from "../constants/abis";
import { callContractMethod } from "./contractErrorHandler";

/**
 * Cache interface for vault addresses and related contracts
 */
interface VaultCache {
  isSupervault?: boolean;
  symVaultAddress?: string;
  delegatorAddress?: string;
  burnerAddress?: string;
}

/**
 * Contract Provider for handling contract instances with caching
 */
export class ContractProvider {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private vaultTypeClient: VaultTypeClient;
  private vaultCache: Map<string, VaultCache>;

  /**
   * Creates a new ContractProvider instance
   * @param provider Ethereum provider
   * @param signer Optional signer for transactions
   */
  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    this.vaultTypeClient = new VaultTypeClient(provider);
    this.vaultCache = new Map();
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
   * Get the ERC20 Byzantine vault contract instance
   * @param vaultAddress The address of the ERC20 vault
   * @returns The ERC20 contract instance
   */
  public getByzVaultContract(vaultAddress: string): ethers.Contract {
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
  public getSuperVaultContract(vaultAddress: string): ethers.Contract {
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
  public async getSymVaultContract(
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
   * Get the sym vault address of a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The sym vault address
   */
  public async getSymVaultAddress(vaultAddress: string): Promise<string> {
    const symVaultContract = await this.getSymVaultContract(vaultAddress);
    return await symVaultContract.getAddress();
  }

  /**
   * Get the Delegator contract instance
   * @param vaultAddress The address of the vault
   * @returns The Delegator contract instance
   */
  public async getDelegatorContract(
    vaultAddress: string
  ): Promise<ethers.Contract> {
    // Check if we have the delegator address in cache
    const cache = this.vaultCache.get(vaultAddress);
    if (cache?.delegatorAddress) {
      return new ethers.Contract(
        cache.delegatorAddress,
        DELEGATOR_ABI,
        this.signer || this.provider
      );
    }

    // First get the symVault contract
    const symVaultContract = await this.getSymVaultContract(vaultAddress);

    // Get the delegator address from the symVault contract
    const delegatorAddress = await callContractMethod<string>(
      symVaultContract,
      "delegator"
    );

    // Update cache
    this.vaultCache.set(vaultAddress, {
      ...cache,
      delegatorAddress,
    });

    return new ethers.Contract(
      delegatorAddress,
      DELEGATOR_ABI,
      this.signer || this.provider
    );
  }

  /**
   * Get the delegator address for a vault
   * @param vaultAddress The address of the vault
   * @returns The delegator address
   */
  public async getDelegatorAddress(vaultAddress: string): Promise<string> {
    const cache = this.vaultCache.get(vaultAddress);
    if (cache?.delegatorAddress) {
      return cache.delegatorAddress;
    }

    // First get the symVault contract
    const symVaultContract = await this.getSymVaultContract(vaultAddress);

    // Get the delegator address from the symVault contract
    const delegatorAddress = await callContractMethod<string>(
      symVaultContract,
      "delegator"
    );

    // Update cache
    this.vaultCache.set(vaultAddress, {
      ...cache,
      delegatorAddress,
    });

    return delegatorAddress;
  }

  /**
   * Get the Burner contract instance
   * @param vaultAddress The address of the vault
   * @returns The Burner contract instance
   */
  public async getBurnerContract(
    vaultAddress: string
  ): Promise<ethers.Contract> {
    // Check if we have the burner address in cache
    const cache = this.vaultCache.get(vaultAddress);
    if (cache?.burnerAddress) {
      return new ethers.Contract(
        cache.burnerAddress,
        BURNER_ABI, // Use appropriate ABI for burner
        this.signer || this.provider
      );
    }

    // First get the symVault contract
    const symVaultContract = await this.getSymVaultContract(vaultAddress);

    // Get the burner address from the symVault contract
    const burnerAddress = await callContractMethod<string>(
      symVaultContract,
      "burner"
    );

    // Update cache
    this.vaultCache.set(vaultAddress, {
      ...cache,
      burnerAddress,
    });

    return new ethers.Contract(
      burnerAddress,
      BURNER_ABI, // Use appropriate ABI for burner
      this.signer || this.provider
    );
  }

  /**
   * Get the burner address for a vault
   * @param vaultAddress The address of the vault
   * @returns The burner address
   */
  public async getBurnerAddress(vaultAddress: string): Promise<string> {
    const cache = this.vaultCache.get(vaultAddress);
    if (cache?.burnerAddress) {
      return cache.burnerAddress;
    }

    // First get the symVault contract
    const symVaultContract = await this.getSymVaultContract(vaultAddress);

    // Get the burner address from the symVault contract
    const burnerAddress = await callContractMethod<string>(
      symVaultContract,
      "burner"
    );

    // Update cache
    this.vaultCache.set(vaultAddress, {
      ...cache,
      burnerAddress,
    });

    return burnerAddress;
  }
}
