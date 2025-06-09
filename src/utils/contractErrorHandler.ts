/**
 * Contract Error Handler Utility
 *
 * Helper functions to standardize contract error handling across the SDK
 */

import { ethers, TransactionResponse } from "ethers";
import { ErrorCodeMapping } from "./errorCodeMapping";

/**
 * Execute a contract method with proper error handling
 * Uses staticCall to get meaningful errors before executing transaction
 *
 * @param contract - Ethers contract instance
 * @param method - Method name to call
 * @param args - Arguments to pass to the method
 * @returns Promise resolving to transaction response
 */
export async function executeContractMethod(
  contract: ethers.Contract,
  method: string,
  ...args: any[]
): Promise<TransactionResponse> {
  try {
    // Separate transaction options from method arguments
    // The last argument might be transaction options if it has transaction properties
    let methodArgs = args;
    let txOptions = {};

    // Check if the last argument looks like transaction options
    if (args.length > 0) {
      const lastArg = args[args.length - 1];
      if (
        lastArg &&
        typeof lastArg === "object" &&
        (lastArg.gasLimit ||
          lastArg.gasPrice ||
          lastArg.value ||
          lastArg.nonce ||
          lastArg.type ||
          lastArg.maxFeePerGas ||
          lastArg.maxPriorityFeePerGas)
      ) {
        txOptions = lastArg;
        methodArgs = args.slice(0, -1);
      }
    }

    // First try with staticCall to get a meaningful error (without tx options)
    await contract[method].staticCall(...methodArgs);

    // If staticCall succeeds, execute the real transaction with options
    return await contract[method](...methodArgs, txOptions);
  } catch (error: any) {
    throw formatContractError(method, error);
  }
}

/**
 * Execute a read-only contract method with proper error handling
 *
 * @param contract - Ethers contract instance
 * @param method - Method name to call
 * @param args - Arguments to pass to the method
 * @returns Promise resolving to the method's return value
 */
export async function callContractMethod<T>(
  contract: ethers.Contract,
  method: string,
  ...args: any[]
): Promise<T> {
  try {
    return await contract[method](...args);
  } catch (error: any) {
    throw formatContractError(method, error);
  }
}

/**
 * Format a contract error into a more meaningful message
 *
 * @param method - Contract method name
 * @param error - Error object
 * @returns Error with improved message
 */
export function formatContractError(method: string, error: any): Error {
  // console.log("Going to format contract error", method, error);
  // console.log("Error revert", error.revert);
  // console.log("Error reason", error.reason);
  // console.log("Error message", error.message);
  // console.log("Error stack", error.stack);
  // console.log("Error code", error.code);
  // console.log("Error data", error.data);
  // console.log("Error error", error.error);
  // Extract error reason from revert data if available
  if (error.revert) {
    const errorName = error.revert.name;
    const errorArgs = error.revert.args;
    let argsStr = "";

    try {
      // Format args as string, handling different types
      argsStr = errorArgs
        .map((arg: any) => {
          if (typeof arg === "bigint") {
            return arg.toString();
          }
          return arg;
        })
        .join(", ");
    } catch (e) {
      argsStr = "unparsable args";
    }

    return new Error(`Contract error: ${errorName}(${argsStr})`);
  }

  // If we got a standard reason
  if (error.reason) {
    return new Error(`Contract error: ${error.reason}`);
  }

  // Check if error has data property and it's in our error mapping
  if (error.data && ErrorCodeMapping[error.data]) {
    return new Error(`Contract error: ${ErrorCodeMapping[error.data]}`);
  }

  // For any other error
  return new Error(
    `Failed to execute ${method}: ${error.message || "Unknown error"}`
  );
}
