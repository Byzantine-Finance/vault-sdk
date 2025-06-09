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
const { ByzantineClient, convertMetadataToURI } = require("../dist");
const { getNetworkConfig } = require("../dist/constants");
const { logTitle, logResult, assert, getWalletBalances } = require("./utils");
require("dotenv").config();

// Import environment variables
const { RPC_URL, MNEMONIC, PRIVATE_KEY, DEFAULT_CHAIN_ID } = process.env;

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

  if (!MNEMONIC && !PRIVATE_KEY) {
    console.warn(
      "⚠️ Warning: Neither MNEMONIC nor PRIVATE_KEY set in .env file. Wallet tests will be skipped."
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
  let wallet;
  if (MNEMONIC) {
    wallet = ethers.Wallet.fromPhrase(MNEMONIC).connect(provider);
    console.log("Using wallet from mnemonic phrase");
  } else if (PRIVATE_KEY) {
    wallet = new ethers.Wallet(PRIVATE_KEY).connect(provider);
    console.log("Using wallet from private key");
  } else {
    throw new Error("No wallet credentials provided");
  }
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

  const VAULT_ADDRESS = "0x56d8b9536552cd17af1a7dcc72dc506a168a950c"; // Symbiotic wstETH Vault
  const REQUEST_ID =
    "0x8464CDF1DF874AF88F771A069DFB5FB1724EFC234B53FEA0129AC2696C40EBDB";

  console.log("Network:", networkConfig.name, `(Chain ID: ${chainId})`);
  console.log("User address:", userAddress);
  console.log("Vault address:", VAULT_ADDRESS);
  console.log("Request ID:", REQUEST_ID);

  try {
    const metadata = await convertMetadataToURI({
      name: "Valid Name",
      description: "desc",
      image_url: "https://example.com/image.png",
      social_github: "https://notgithub.com/user",
    });
    logResult("Metadata", true, metadata);

    // const deposit = await client.depositToVault(
    //   VAULT_ADDRESS,
    //   ethers.parseEther("0.15"),
    //   true
    // );
    // const tx = await deposit.wait();
    // logResult("Deposit", true, tx?.hash);
    // const deposit = await client.withdrawFromVault(
    //   VAULT_ADDRESS,
    //   ethers.parseEther("0.01")
    // );
    // const tx = await deposit.wait();
    // logResult("Withdrawal", true, tx?.hash);

    // const withdrawalRequest = await client.getWithdrawalRequest(
    //   VAULT_ADDRESS,
    //   REQUEST_ID
    // );
    // logResult("Withdrawal request", true, withdrawalRequest.toString());

    // const claimable = await client.isClaimable(VAULT_ADDRESS, REQUEST_ID);
    // logResult("Claimable", true, claimable.toString());

    // const tx = await client.completeWithdrawal(VAULT_ADDRESS, REQUEST_ID);
    // await tx.wait();
    // logResult("Complete withdrawal", true, tx.hash);

    // ---- Check roles
    // const isCuratorFeeClaimerAdmin = await client.isCuratorFeeClaimerAdmin(
    //   VAULT_ADDRESS,
    //   userAddress
    // );
    // logResult(
    //   "Is curator fee claimer admin",
    //   isCuratorFeeClaimerAdmin,
    //   isCuratorFeeClaimerAdmin ? "true" : "false"
    // );

    // const tx = await client.setCuratorFeeClaimerAdmin(
    //   VAULT_ADDRESS,
    //   userAddress,
    //   true
    // );
    // await tx.wait();
    // logResult("Set curator fee claimer admin", true, tx.hash);

    // const claimable = await client.isClaimable(VAULT_ADDRESS, REQUEST_ID);
    // logResult("Claimable", true, claimable);

    //deposit 0.1 dans le vault
    // const tx = await client.depositToVault(
    //   VAULT_ADDRESS,
    //   ethers.parseEther("0.1"),
    //   true
    // );
    // const receipt = await tx.wait();
    // logResult("Deposit", true, receipt?.hash);

    // completeWithdrawal
    // const tx = await client.completeWithdrawal(VAULT_ADDRESS, REQUEST_ID);
    // await tx.wait();
    // logResult("Complete withdrawal", true, tx);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
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
