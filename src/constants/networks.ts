/**
 * Network configurations for Byzantine Deposit contract
 */

import { NetworkConfig, ChainsOptions } from "../types";

export const ETH_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const NETWORKS: Record<number, NetworkConfig> = {
  // Ethereum Mainnet
  1: {
    name: "Ethereum",
    factoryContractAddress: "0xe0f5fc7913C4aDC0975bD21d20DF7FC27360a267",
    scanLink: "https://etherscan.io",
    stETHAddress: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    wstETHAddress: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
    osETHAddress: "0xf1c9acdc66974dfb6decb12aa385b9cd01190e38",
    mETHAddress: "0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa",
    ETHxAddress: "0xa35b1b31ce002fbf2058d22f30f95d405200a15b",
  },
  // Holesky Testnet
  17000: {
    name: "Holesky",
    factoryContractAddress: "0xe0f5fc7913C4aDC0975bD21d20DF7FC27360a267",
    scanLink: "https://holesky.etherscan.io",
    stETHAddress: "0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034",
    wstETHAddress: "0x8d09a4502Cc8Cf1547aD300E066060D043f6982D",
    osETHAddress: "0xF603c5A3F774F05d4D848A9bB139809790890864",
    mETHAddress: "0xe3C063B1BEe9de02eb28352b55D49D85514C67FF",
    ETHxAddress: "0xB4F5fc289a778B80392b86fa70A7111E5bE0F859",
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
