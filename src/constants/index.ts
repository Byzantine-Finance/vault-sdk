export * from "./networks";
export * from "./byzantineFactoryABI";

/**
 * Constants used across the Byzantine Factory SDK
 */

// Special Ethereum address used to represent native ETH
export const ETH_TOKEN_ADDRESS = "0xEeeeeEeEeEeEeEeEeeEEEeeeeEeeeeeeeEEeE";

// Default gas limits for different operations
export const GAS_LIMITS = {
  createEigenERC20Vault: 5000000000,
  createEigenNativeVault: 5000000000,
  createSymbioticERC20Vault: 5000000000,
  createSuperVaultERC20: 5000000000,
};
