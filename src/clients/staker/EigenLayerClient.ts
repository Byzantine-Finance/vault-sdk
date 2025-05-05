import { ethers } from "ethers";
import { ERC20_VAULT_ABI, SUPER_ERC20_ABI } from "../../constants/abis";
import { VaultTypeClient } from "./VaultType";

interface VaultCache {
  isSupervault?: boolean;
  eigenVaultAddress?: string;
}

export class EigenLayerClient {
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
   * Get the vault contract instance
   * @param vaultAddress The address of the vault or SuperVault
   * @returns The vault contract instance
   */
  private async getVaultContract(
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

    let eigenVaultAdd: string;

    // If we've already determined the eigenVault address, use it
    if (cacheEntry.eigenVaultAddress) {
      eigenVaultAdd = cacheEntry.eigenVaultAddress;
    } else {
      // Otherwise, retrieve it based on the vault type
      if (cacheEntry.isSupervault) {
        // For SuperVaults, we need to get the eigenVault from the SuperVault contract
        const superVaultContract = this.getSuperVaultContract(vaultAddress);
        const [symVaultAddress, eigenVaultAddress] =
          await superVaultContract.getUnderlyingVaults();
        eigenVaultAdd = eigenVaultAddress;
      } else {
        // For regular EigenLayer vaults, the address is the same
        eigenVaultAdd = vaultAddress;
      }

      // Cache the result
      cacheEntry.eigenVaultAddress = eigenVaultAdd;
    }

    return new ethers.Contract(
      eigenVaultAdd,
      ERC20_VAULT_ABI,
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
   * Get the Eigen Operator of a vault
   * @param vaultAddress The address of the vault
   * @returns The Eigen Operator
   */
  async getEigenOperator(vaultAddress: string): Promise<string> {
    const vaultContract = await this.getVaultContract(vaultAddress);
    return await vaultContract.delegatedTo();
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
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }

    const vaultContract = await this.getVaultContract(vaultAddress);
    return await vaultContract.delegateTo(
      operator,
      approverSignatureAndExpiry,
      approverSalt,
      options
    );
  }
}
