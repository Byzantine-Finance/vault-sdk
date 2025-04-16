// @ts-check

/**
 * Common utilities for Byzantine Deposit SDK tests
 * Shared between simple-test.js and advanced-test.js
 */

const { ethers } = require("ethers");

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// Logging utilities
const logTitle = (title = "") => {
  if (title) {
    console.log(`\n===== ${title} =====`);
  }
  console.log("Test Name                                | Status | Result");
  console.log("-".repeat(70));
};

const logResult = (testName, passed, result = "") => {
  const status = passed ? "✅" : "❌";
  const paddedName = testName.padEnd(40);
  console.log(`${paddedName}| ${status}     | ${result}`);
};

// Simple test functions
const assert = (condition, message) => {
  if (!condition) {
    logResult(message, false);
    throw new Error(message);
  }
  return true;
};

const assertThrows = async (fn, message) => {
  try {
    await fn();
    logResult(message, false, "Expected function to throw");
    throw new Error(`Expected function to throw`);
  } catch (error) {
    logResult(message, true, `${error.message.substring(0, 30)}...`);
    return true;
  }
};

/**
 * Retrieve all token balances for a wallet
 * @param {ethers.Provider} provider - Ethers provider
 * @param {string} address - Wallet address to check
 * @param {object} networkConfig - Network configuration with token addresses
 * @returns {Promise<object>} Object with token balances
 */
async function getWalletBalances(provider, address, networkConfig) {
  try {
    // Get ETH balance
    const ethBalance = await provider.getBalance(address);

    // Get stETH balance using the address from networkConfig
    if (!networkConfig.stETHAddress) {
      throw new Error(`stETH address not found in network config`);
    }

    const stEthContract = new ethers.Contract(
      networkConfig.stETHAddress,
      ERC20_ABI,
      provider
    );
    const stEthBalance = await stEthContract.balanceOf(address);
    const stEthDecimals = await stEthContract.decimals();
    const stEthSymbol = await stEthContract.symbol();

    // Get wstETH balance using the address from networkConfig
    if (!networkConfig.wstETHAddress) {
      throw new Error(`wstETH address not found in network config`);
    }

    const wstEthContract = new ethers.Contract(
      networkConfig.wstETHAddress,
      ERC20_ABI,
      provider
    );
    const wstEthBalance = await wstEthContract.balanceOf(address);
    const wstEthDecimals = await wstEthContract.decimals();
    const wstEthSymbol = await wstEthContract.symbol();

    return {
      ETH: {
        balance: ethBalance,
        formatted: ethers.formatEther(ethBalance),
      },
      stETH: {
        balance: stEthBalance,
        formatted: ethers.formatUnits(stEthBalance, stEthDecimals),
        symbol: stEthSymbol,
      },
      wstETH: {
        balance: wstEthBalance,
        formatted: ethers.formatUnits(wstEthBalance, wstEthDecimals),
        symbol: wstEthSymbol,
      },
    };
  } catch (error) {
    console.warn(`⚠️ Error getting wallet balances: ${error.message}`);
    return {
      ETH: { balance: 0n, formatted: "0" },
      stETH: { balance: 0n, formatted: "0", symbol: "stETH" },
      wstETH: { balance: 0n, formatted: "0", symbol: "wstETH" },
    };
  }
}

// Export utilities
module.exports = {
  logTitle,
  logResult,
  assert,
  assertThrows,
  getWalletBalances,
};
