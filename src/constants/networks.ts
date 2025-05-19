/**
 * Network configurations for Byzantine Deposit contract
 */

import { NetworkConfig, ChainsOptions } from "../types";

export const ETH_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const NETWORKS: Record<number, NetworkConfig> = {
  // Ethereum Mainnet
  // 1: {
  //   name: "Ethereum",
  //   factoryContractAddress: "0xa9dcf24B1463c57a442a0dE274607C2b4B952634",
  //   scanLink: "https://etherscan.io",
  //   stETHAddress: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
  //   wstETHAddress: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
  //   osETHAddress: "0xf1c9acdc66974dfb6decb12aa385b9cd01190e38",
  //   mETHAddress: "0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa",
  //   ETHxAddress: "0xa35b1b31ce002fbf2058d22f30f95d405200a15b",
  // },
  // Holesky Testnet
  17000: {
    name: "Holesky",
    factoryContractAddress: "0x8080e4C9a3dCdA4Ce832Ab1A0Bc971079f81338D",
    scanLink: "https://holesky.etherscan.io",
    stETHAddress: "0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034",
    wstETHAddress: "0x8d09a4502Cc8Cf1547aD300E066060D043f6982D",
    osETHAddress: "0xF603c5A3F774F05d4D848A9bB139809790890864",
    mETHAddress: "0xe3C063B1BEe9de02eb28352b55D49D85514C67FF",
    ETHxAddress: "0xB4F5fc289a778B80392b86fa70A7111E5bE0F859",
  },
  // Ethereum Sepolia
  11155111: {
    name: "Ethereum Sepolia",
    factoryContractAddress: "0x4C4b2673a5dd0fe70eb7e9A85b45dFb7822e197e",
    scanLink: "https://sepolia.etherscan.io",
    stETHAddress: "0x3e3FE7dBc6B4C189E7128855dD526361c49b40Af",
    wstETHAddress: "0xB82381A3fBD3FaFA77B3a7bE693342618240067b",
    osETHAddress: undefined,
    mETHAddress: "0x072d71b257ECa6B60b5333626F6a55ea1B0c451c",
    ETHxAddress: undefined,
  },
  // Hoodie Testnet
  // 560048: {
  //   name: "Hoodie Testnet",
  //   factoryContractAddress: "0xa9dcf24B1463c57a442a0dE274607C2b4B952634",
  //   scanLink: "https://hoodi.etherscan.io/",
  //   stETHAddress: "0x3508A952176b3c15387C97BE809eaffB1982176a",
  //   wstETHAddress: "0x7E99eE3C66636DE415D2d7C880938F2f40f94De4",
  //   osETHAddress: "0x7345fC8268459413beE9e9dd327f31283C65Ee7e",
  //   mETHAddress: undefined,
  //   ETHxAddress: undefined,
  // },
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
