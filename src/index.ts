/**
 * Restake SDK - Main export file
 */

// Export main clients
export { ByzantineFactoryClient } from "./clients/ByzantineFactoryClient";

// Export types
export * from "./types";

// Export vault creation functions
export * from "./clients/curators";

// Export vault operation functions
export * from "./clients/staker";

// Export constants and utilities
export * from "./constants";
export * from "./constants/networks";
export * from "./constants/abis";

// Export clients
// export { ByzantineFactoryWagmiClient } from "./clients/ByzantineFactoryWagmiClient";

// Export hooks for React disabled due to ESM compatibility issues
// export * from "./hooks";
