/**
 * Network configurations for Byzantine Deposit contract
 */

import { NetworkConfig, ChainsOptions } from "../types";

export const ETH_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const NETWORKS: Record<number, NetworkConfig> = {
  // Ethereum Mainnet
  1: {
    name: "Ethereum",
    factoryContractAddress: "0x304AF230BD46Ef3dfe2c26c37207a21Eeb992088",
    scanLink: "https://etherscan.io",
    stETHAddress: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    wstETHAddress: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
    theGraphApiUrl: process.env.NEXT_PUBLIC_THEGRAPH_KEY
      ? `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_THEGRAPH_KEY}/subgraphs/id/qtx1zvMXM3doNdjbavnyhgmKNLQdeVDqVGNQTp6mVEW`
      : undefined,
  },
  // Holesky Testnet
  17000: {
    name: "Holesky",
    factoryContractAddress: "0x304AF230BD46Ef3dfe2c26c37207a21Eeb992088",
    scanLink: "https://holesky.etherscan.io",
    stETHAddress: "0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034",
    wstETHAddress: "0x8d09a4502Cc8Cf1547aD300E066060D043f6982D",
    theGraphApiUrl: process.env.NEXT_PUBLIC_THEGRAPH_KEY
      ? `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_THEGRAPH_KEY}/subgraphs/id/21P9dycN67dz821r26L6UzgsuKehRV4jiMEmH3GJLYyi`
      : undefined,
  },
};

/**
 * Gets network configuration for the specified chain ID
 * @param chainId - The chain ID to get configuration for
 * @returns Network configuration or undefined if not supported
 */
export function getNetworkConfig(chainId: 1 | 17000): NetworkConfig {
  return NETWORKS[chainId];
}

/**
 * Gets supported chain IDs
 * @returns Array of supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(NETWORKS).map((id) => parseInt(id));
}

/**
 * Check if a chain ID is supported
 * @param chainId The chain ID to check
 * @returns True if the chain ID is supported, false otherwise
 */
export function isChainSupported(chainId: ChainsOptions): boolean {
  return !!NETWORKS[chainId];
}
