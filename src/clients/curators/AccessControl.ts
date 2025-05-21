import { ethers } from "ethers";
import { ERC20_VAULT_ABI } from "../../constants/abis";
import { erc20Abi } from "viem";
import { callContractMethod, executeContractMethod } from "../../utils";
import { ContractProvider } from "../../utils/ContractProvider";

export enum RoleType {
  DEFAULT_ADMIN_ROLE = "RoleManager",
  VERSION_MANAGER = "VersionManager",
  WHITELIST_MANAGER = "WhitelistManager",
  LIMIT_MANAGER = "LimitManager",
  CURATOR_FEE_CLAIMER = "CuratorFeeClaimer",
  CURATOR_FEE_CLAIMER_ADMIN = "CuratorFeeClaimerAdmin",

  // For native vaults
  VALIDATORS_MANAGER = "ValidatorsManager",

  // For SuperVaults
  CURATOR = "Curator",

  // For EigenLayer vaults
  DELEGATION_MANAGER = "DelegationManager",

  // For Symbiotic vaults
  OPERATOR_NETWORK_SHARES_SET = "OperatorNetworkSharesSet",
  OPERATOR_NETWORK_LIMIT_SET = "OperatorNetworkLimitSet",
  NETWORK_LIMIT_SET = "NetworkLimitSet",
  OWNER_BURNER = "OwnerBurner", // Only 1 address can be set
}

// Role identifiers constants
const ROLES: Record<RoleType, string> = {
  // Base vault roles
  [RoleType.DEFAULT_ADMIN_ROLE]:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  [RoleType.VERSION_MANAGER]:
    "0x7daa70daa195905862e9fca178089de90a69f7175eb24d1b44e833ee4d44856a",
  [RoleType.WHITELIST_MANAGER]:
    "0x2ca4bff3f985a19d8e4391cdb6bb4ba90be6978dbd55d28447c299e24c9c0617",
  [RoleType.LIMIT_MANAGER]:
    "0x2daae8ba7365f6f763eb697026a620260780c59702069f99d114d184d7a3303b",
  [RoleType.CURATOR_FEE_CLAIMER]:
    "0x2e032b4749979aef0e1b34eddc3717541d1ab39293d421fa00e58f6a678b9a6f",
  [RoleType.CURATOR_FEE_CLAIMER_ADMIN]:
    "0xc195b19f02e8bd4c0e305d5897521ab4005c0949f23d660680cb2fedd220dc82",

  // Native vault roles
  [RoleType.VALIDATORS_MANAGER]:
    "0xa801e88138e912e597385e9bcfd47f2bc8e5a504a6a10f769c00037777460f27",

  // Supervault
  [RoleType.CURATOR]:
    "0x850d585eb7f024ccee5e68e55f2c26cc72e1e6ee456acf62135757a5eb9d4a10",

  // Eigenlayer
  [RoleType.DELEGATION_MANAGER]:
    "0xaffc80246c786316e7b4f97df755a8847c4a18273ce2fda1b5ff2d866bd29d94",

  // Symbiotic
  [RoleType.OPERATOR_NETWORK_SHARES_SET]:
    "0x1312a1cf530e56add9be4fd84db9051dcc7635952f09f735f9a29405b5584625",
  [RoleType.OPERATOR_NETWORK_LIMIT_SET]:
    "0x15e7c882d74e8821ebf34aaff46fd0e1d53b9393d91490019124113d28dc32a3",
  [RoleType.NETWORK_LIMIT_SET]:
    "0x008b9b1e5fa9cf3b14f87f435649268146305ddf689f082e5961a335b07a9abf",
  [RoleType.OWNER_BURNER]: "", // Empty because we don't access it with the AccessControl contract
};

export class AccessControlClient {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private contractProvider: ContractProvider;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    this.contractProvider = new ContractProvider(provider, signer);
  }

  private getVaultContract(vaultAddress: string): ethers.Contract {
    return new ethers.Contract(
      vaultAddress,
      ERC20_VAULT_ABI,
      this.signer || this.provider
    );
  }

  /**
   * Get delegator contract for a vault
   * @param vaultAddress The address of the vault
   * @returns The delegator contract instance
   */
  private async getDelegatorContract(
    vaultAddress: string
  ): Promise<ethers.Contract> {
    return await this.contractProvider.getDelegatorContract(vaultAddress);
  }

  /**
   * Get burner contract for a vault
   * @param vaultAddress The address of the vault
   * @returns The burner contract instance
   */
  private async getBurnerContract(
    vaultAddress: string
  ): Promise<ethers.Contract> {
    return await this.contractProvider.getBurnerContract(vaultAddress);
  }

  /**
   * Check if an address has a specific role for a vault
   * @param vaultAddress The address of the vault to check
   * @param roleType The type of role to check (e.g., RoleType.CURATOR, RoleType.LIMIT_MANAGER)
   * @param address The address to check for the role
   * @returns True if the address has the specified role, false otherwise
   * @example
   * // Check if an address is a curator
   * const isCurator = await client.isManager(
   *   "0x123...vault",
   *   RoleType.CURATOR,
   *   "0x456...address"
   * );
   */
  async isManager(
    vaultAddress: string,
    roleType: RoleType,
    address: string
  ): Promise<boolean> {
    let contract: ethers.Contract;
    if (roleType === RoleType.OWNER_BURNER) {
      const burnerContract = await this.getBurnerContract(vaultAddress);
      const ownerOfBurner = await callContractMethod<string>(
        burnerContract,
        "owner"
      );
      const isOwner = ownerOfBurner.toLowerCase() === address.toLowerCase();
      return isOwner;
    } else if (
      roleType === RoleType.OPERATOR_NETWORK_SHARES_SET ||
      roleType === RoleType.OPERATOR_NETWORK_LIMIT_SET ||
      roleType === RoleType.NETWORK_LIMIT_SET
    ) {
      contract = await this.getDelegatorContract(vaultAddress);
    } else {
      contract = this.getVaultContract(vaultAddress);
    }
    return await callContractMethod<boolean>(
      contract,
      "hasRole",
      ROLES[roleType],
      address
    );
  }

  /**
   * Set or revoke a role for an address
   * @param vaultAddress The address of the vault to modify roles for
   * @param roleType The type of role to set (e.g., RoleType.CURATOR, RoleType.LIMIT_MANAGER)
   * @param address The address to grant or revoke the role for
   * @param enable True to grant the role, false to revoke it
   * @returns Transaction response from the blockchain
   * @example
   * // Grant curator role to an address
   * const tx = await client.setManager(
   *   "0x123...vault",
   *   RoleType.CURATOR,
   *   "0x456...address",
   *   true
   * );
   * await tx.wait();
   *
   * // Revoke limit manager role from an address
   * const tx = await client.setManager(
   *   "0x123...vault",
   *   RoleType.LIMIT_MANAGER,
   *   "0x456...address",
   *   false
   * );
   * await tx.wait();
   */
  async setManager(
    vaultAddress: string,
    roleType: RoleType,
    address: string,
    enable: boolean
  ): Promise<ethers.TransactionResponse> {
    const method = enable ? "grantRole" : "revokeRole";
    let contract: ethers.Contract;
    if (roleType === RoleType.OWNER_BURNER) {
      contract = await this.getBurnerContract(vaultAddress);
      return await executeContractMethod(
        contract,
        "transferOwnership",
        address
      );
    } else if (
      roleType === RoleType.OPERATOR_NETWORK_SHARES_SET ||
      roleType === RoleType.OPERATOR_NETWORK_LIMIT_SET ||
      roleType === RoleType.NETWORK_LIMIT_SET
    ) {
      contract = await this.getDelegatorContract(vaultAddress);
    } else {
      contract = this.getVaultContract(vaultAddress);
    }
    return await executeContractMethod(
      contract,
      method,
      ROLES[roleType],
      address
    );
  }
}
