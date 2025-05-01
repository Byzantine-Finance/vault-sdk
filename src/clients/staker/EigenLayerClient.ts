import { ethers } from "ethers";
import { ERC20_VAULT_ABI } from "../../constants/abis";

export class EigenLayerClient {
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
   * Get the Eigen Operator of a vault
   * @param vaultAddress The address of the vault
   * @returns The Eigen Operator
   */
  async getEigenOperator(vaultAddress: string): Promise<string> {
    const vaultContract = this.getVaultContract(vaultAddress);
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

    const vaultContract = this.getVaultContract(vaultAddress);
    return await vaultContract.delegateTo(
      operator,
      approverSignatureAndExpiry,
      approverSalt,
      options
    );
  }
}
