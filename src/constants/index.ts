export * from "./networks";
export * from "./byzantineFactoryABI";

/**
 * Constants used across the SDK
 */

// Special token address to represent native ETH in operations
export const ETH_TOKEN_ADDRESS = "0xEeeeeEeEeEeEeEeEeeEEEeeeeEeeeeeeeEEeE";

// Gas limits for different operations
export const GAS_LIMITS = {
  // Creation gas limits
  createEigenERC20Vault: 3000000,
  createEigenNativeVault: 5000000,
  createSymbioticERC20Vault: 5000000,
  createSuperVaultERC20: 6000000,

  // Deposit gas limits
  depositERC20: 300000,
  depositNative: 300000,

  // Withdraw gas limits
  withdraw: 300000,
  redeem: 300000,

  // Management gas limits
  setDepositLimit: 100000,
  setIsPrivateVault: 100000,
  setDepositWhitelistedStatus: 150000,
  setCuratorFee: 100000,
  grantRole: 100000,
  revokeRole: 100000,
};
