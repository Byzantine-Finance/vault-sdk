/**
 * Network configurations for Byzantine Deposit contract
 */

import { NetworkConfig } from "../types";

export const ETH_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const NETWORKS: Record<number, NetworkConfig> = {
  // Ethereum Mainnet
  1: {
    name: "Ethereum",
    factoryContractAddress: "0x53CC4133F7A60d48E91D8D27b910a474a3Be9f7d",
    scanLink: "https://etherscan.io",
    theGraphApiUrl: process.env.NEXT_PUBLIC_THEGRAPH_KEY
      ? `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_THEGRAPH_KEY}/subgraphs/id/qtx1zvMXM3doNdjbavnyhgmKNLQdeVDqVGNQTp6mVEW`
      : undefined,
    stETHAddress: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    wstETHAddress: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
  },
  // Holesky Testnet
  17000: {
    name: "Holesky",
    factoryContractAddress: "0x53CC4133F7A60d48E91D8D27b910a474a3Be9f7d",
    scanLink: "https://holesky.etherscan.io",
    theGraphApiUrl: process.env.NEXT_PUBLIC_THEGRAPH_KEY
      ? `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_THEGRAPH_KEY}/subgraphs/id/21P9dycN67dz821r26L6UzgsuKehRV4jiMEmH3GJLYyi`
      : undefined,
    stETHAddress: "0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034",
    wstETHAddress: "0x8d09a4502Cc8Cf1547aD300E066060D043f6982D",
  },
};

/**
 * Gets network configuration for the specified chain ID
 * @param chainId - The chain ID to get configuration for
 * @returns Network configuration or undefined if not supported
 */
export function getNetworkConfig(chainId: number): NetworkConfig | undefined {
  return NETWORKS[chainId];
}

/**
 * Gets supported chain IDs
 * @returns Array of supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(NETWORKS).map((id) => parseInt(id));
}
