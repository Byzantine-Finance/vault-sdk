// delegatedTo

import { ethers } from "ethers";
import { ETH_TOKEN_ADDRESS } from "../../constants";
import { erc20Abi } from "viem";
import { ERC20_VAULT_ABI } from "../../constants/abis";

/**
 * Get the operator address for an Eigenlayer vault
 * @param vaultContract - The vault contract instance
 * @returns The operator address
 */
export async function getEigenOperator(
  vaultContract: ethers.Contract
): Promise<string> {
  return await vaultContract.delegatedTo();
}

/**
 * Set the operator address for an Eigenlayer vault
 * @param signer - The signer to execute the transaction
 * @param vaultContract - The vault contract instance
 * @param operator - The operator address
 * @param approverSignatureAndExpiry - The approver signature and expiry
 * @param approverSalt - The approver salt
 * @param options - Optional transaction options
 * @returns The transaction response
 */
export async function setEigenOperator(
  signer: ethers.Signer,
  vaultContract: ethers.Contract,
  operator: string,
  approverSignatureAndExpiry: {
    signature: string;
    expiry: number;
  },
  approverSalt: string,
  options?: Partial<ethers.TransactionRequest>
): Promise<ethers.TransactionResponse> {
  return await vaultContract.delegateTo(
    operator,
    approverSignatureAndExpiry,
    approverSalt,
    options
  );
}
