// @ts-check

/**
 * Byzantine Vault Data Reading Test
 *
 * This test demonstrates how to retrieve and display various data from Byzantine vaults
 * using the Byzantine SDK Client. It covers a comprehensive set of vault information
 * retrieval functions without modifying vault state.
 *
 * Tests included:
 * 1. Basic Vault Information - Asset address, TVL, metadata
 * 2. User-specific Information - Balances, allowances, whitelist status
 * 3. Administrative Information - Fee settings, deposit limits, privacy settings
 * 4. Shares Information - Token name, symbol, supply, conversion rates
 */

const { ethers } = require("ethers");
const { ByzantineClient } = require("../dist");
const { getNetworkConfig } = require("../dist/constants");
const { logTitle, logResult, assert, getWalletBalances } = require("./utils");
require("dotenv").config();

// Import environment variables
const { RPC_URL, MNEMONIC, DEFAULT_CHAIN_ID } = process.env;

// Skip network tests if API key is not provided
if (!RPC_URL) {
  console.warn(
    "⚠️ Warning: RPC_URL not set in .env file. Network tests will be skipped."
  );
}

// Test suite
async function runTests() {
  console.log("\n🧪 Byzantine SDK - Vault Data Reading Test 🧪\n");

  // Check if environment variables are set
  const parsedId = DEFAULT_CHAIN_ID ? parseInt(DEFAULT_CHAIN_ID) : 17000;
  const chainId = parsedId === 1 ? 1 : 17000;

  let skipNetworkTests = false;
  if (!RPC_URL) {
    console.warn(
      "⚠️ Warning: RPC_URL not set in .env file. Network tests will be skipped."
    );
    skipNetworkTests = true;
  }

  if (!MNEMONIC) {
    console.warn(
      "⚠️ Warning: MNEMONIC not set in .env file. Wallet tests will be skipped."
    );
    skipNetworkTests = true;
  }

  console.log(
    `Network: ${
      chainId === 1
        ? "Ethereum Mainnet"
        : chainId === 17000
        ? "Holesky Testnet"
        : "Unknown"
    } (Chain ID: ${chainId})\n`
  );

  // Skip tests requiring network connection if no API key
  skipNetworkTests = !RPC_URL;

  if (skipNetworkTests) {
    console.log(
      "⚠️ Network tests skipped. Please provide RPC_URL to run tests."
    );
    return;
  }

  // Initialize provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = ethers.Wallet.fromPhrase(MNEMONIC).connect(provider);
  const userAddress = await wallet.getAddress();

  // Initialize client
  const client = new ByzantineClient({
    chainId: chainId,
    provider: provider,
    signer: wallet,
  });

  // Get network configuration for token addresses
  const networkConfig = getNetworkConfig(chainId);

  logResult("Client initialization", true);
  assert(client !== undefined, "Client initialization");

  // Test vault addresses - add your own or use these examples

  const VAULT_ADDRESS = "0x26b1086c36Cf1Ee780005937C30Cb58d6E0Fc960"; // Eigen stETH vault
  const REQUEST_ID =
    "0xBBB5C00413D3D0541A8B48189AA3652F4F3A2AAA820FD9ED044F9B83503F4A1B";

  console.log("Network:", networkConfig.name, `(Chain ID: ${chainId})`);
  console.log("User address:", userAddress);
  console.log("Vault address:", VAULT_ADDRESS);

  try {
    // const claimable = await client.isClaimable(VAULT_ADDRESS, REQUEST_ID);
    // logResult("Claimable", true, claimable);

    //deposit 0.1 dans le vault
    const tx = await client.depositToVault(
      VAULT_ADDRESS,
      ethers.parseEther("0.1"),
      true
    );
    await tx.wait();
    logResult("Deposit", true, tx.hash);

    // completeWithdrawal
    // const tx = await client.completeWithdrawal(VAULT_ADDRESS, REQUEST_ID);
    // await tx.wait();
    // logResult("Complete withdrawal", true, tx);
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run tests if file is executed directly
if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}

module.exports = { runTests };
