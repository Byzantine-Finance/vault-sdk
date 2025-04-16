/**
 * Network utilities for the Byzantine Factory SDK
 */

import { NetworkConfig } from "../types";

// Network configurations
const NETWORK_CONFIGS: { [key: number]: NetworkConfig } = {
  // Ethereum Mainnet
  1: {
    name: "Ethereum Mainnet",
    factoryContractAddress: "0x53CC4133F7A60d48E91D8D27b910a474a3Be9f7d", // Replace with actual address
    scanLink: "https://etherscan.io",
    theGraphApiUrl:
      "https://api.thegraph.com/subgraphs/name/byzantine/factory-mainnet",
    stETHAddress: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    wstETHAddress: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
  },
  // Holesky Testnet
  17000: {
    name: "Holesky Testnet",
    factoryContractAddress: "0x53CC4133F7A60d48E91D8D27b910a474a3Be9f7d", // Replace with actual address
    scanLink: "https://holesky.etherscan.io",
    theGraphApiUrl:
      "https://api.thegraph.com/subgraphs/name/byzantine/factory-holesky",
    stETHAddress: "0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034",
    wstETHAddress: "0x8d09a4502Cc8Cf1547aD300E066060D043f6982D",
  },
};

/**
 * Get network configuration for a specific chain ID
 * @param chainId The chain ID to get configuration for
 * @returns The network configuration or undefined if not supported
 */
export function getNetworkConfig(chainId: number): NetworkConfig | undefined {
  return NETWORK_CONFIGS[chainId];
}

/**
 * Check if a chain ID is supported
 * @param chainId The chain ID to check
 * @returns True if the chain ID is supported, false otherwise
 */
export function isChainSupported(chainId: number): boolean {
  return !!NETWORK_CONFIGS[chainId];
}
