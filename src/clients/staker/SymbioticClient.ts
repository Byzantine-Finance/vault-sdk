import { ethers } from "ethers";
import { VaultTypeClient } from "./VaultType";
import { callContractMethod } from "../../utils";
import { ContractProvider } from "../../utils/ContractProvider";
import { DelegatorType } from "../../types";

export class SymbioticClient {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private contractProvider: ContractProvider;
  private vaultTypeClient: VaultTypeClient;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    this.contractProvider = new ContractProvider(provider, signer);
    this.vaultTypeClient = new VaultTypeClient(provider);
  }

  /**
   * Get the Symbiotic Vault contract instance
   * @param vaultAddress The address of the Symbiotic vault or SuperVault
   * @returns The Vault contract instance
   */
  private async getSymVaultContract(
    vaultAddress: string
  ): Promise<ethers.Contract> {
    return await this.contractProvider.getSymVaultContract(vaultAddress);
  }

  /**
   * Get the sym vault address of a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The sym vault address
   */
  public async getSymVaultAddress(vaultAddress: string): Promise<string> {
    return await this.contractProvider.getSymVaultAddress(vaultAddress);
  }

  /**
   * Clear the cache for a specific vault or all vaults
   * @param vaultAddress Optional address of the vault to clear from cache
   */
  public clearCache(vaultAddress?: string): void {
    this.contractProvider.clearCache(vaultAddress);
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

  /**
   * Get the Delegator contract instance
   * @param vaultAddress The address of the vault
   * @returns The Delegator contract instance
   */
  private async getDelegatorContract(
    vaultAddress: string
  ): Promise<ethers.Contract> {
    return await this.contractProvider.getDelegatorContract(vaultAddress);
  }

  /**
   * Get the delegator address for a vault
   * @param vaultAddress The address of the vault
   * @returns The delegator address
   */
  public async getDelegatorAddress(vaultAddress: string): Promise<string> {
    return await this.contractProvider.getDelegatorAddress(vaultAddress);
  }

  /**
   * Get the slasher address for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The slasher address
   */
  async getSlasherAddress(vaultAddress: string): Promise<string> {
    return await this.contractProvider.getSlasherAddress(vaultAddress);
  }

  /**
   * Get the delegator type for a Symbiotic vault
   * @param vaultAddress The address of the vault
   * @returns The delegator type
   */
  async getDelegatorType(vaultAddress: string): Promise<DelegatorType> {
    const delegatorContract = await this.getDelegatorContract(vaultAddress);
    return await callContractMethod<DelegatorType>(delegatorContract, "TYPE");
  }

  /**
   * Get the burner address for a vault
   * @param vaultAddress The address of the vault
   * @returns The burner address
   */
  public async getBurnerAddress(vaultAddress: string): Promise<string> {
    return await this.contractProvider.getBurnerAddress(vaultAddress);
  }

  /**
   * Get the delegator operator for a vault, only for OSD and ONSD vaults
   * @param vaultAddress The address of the vault
   * @returns The delegator operator
   */
  public async getDelegatorOperator(vaultAddress: string): Promise<string> {
    const delegatorContract = await this.getDelegatorContract(vaultAddress);
    try {
      return await callContractMethod<string>(delegatorContract, "operator");
    } catch (error) {
      throw new Error("Not an OSD or ONSD vault");
    }
  }

  /**
   * Get the delegator network for a vault, only for ONSD vaults
   * @param vaultAddress The address of the vault
   * @returns The delegator network
   */
  public async getDelegatorNetwork(vaultAddress: string): Promise<string> {
    const delegatorContract = await this.getDelegatorContract(vaultAddress);
    try {
      return await callContractMethod<string>(delegatorContract, "network");
    } catch (error) {
      throw new Error("Not an ONSD vault");
    }
  }
}
