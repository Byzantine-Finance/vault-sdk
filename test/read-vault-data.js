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

  const VAULT_ADDRESS = "0x356263fb24dd67ccb4f1012ac8562e3dc23f982c";

  console.log("Network:", networkConfig.name, `(Chain ID: ${chainId})`);
  console.log("User address:", userAddress);

  try {
    // =============================================
    // 1. Basic Vault Information
    // =============================================
    logTitle("Basic Vault Information");

    // Get vault asset address
    const assetAddress = await client.getVaultAsset(VAULT_ADDRESS);
    logResult("Vault asset address", true, assetAddress);

    // Get vault TVL (Total Value Locked)
    const tvl = await client.getVaultTVL(VAULT_ADDRESS);
    logResult("Vault TVL", true, ethers.formatEther(tvl) + " tokens");

    // Get vault metadata URI
    // const metadataURI = await client.getVaultMetadataURI(VAULT_ADDRESS);
    // logResult("Vault metadata URI", true, metadataURI);

    // =============================================
    // 2. User-specific Information
    // =============================================
    logTitle("User-specific Information");

    // Get user wallet balance
    const userWalletBalance = await client.getUserWalletBalance(
      assetAddress,
      userAddress
    );
    logResult(
      "User wallet balance",
      true,
      ethers.formatEther(userWalletBalance) + " tokens"
    );

    // Get user vault balance (shares)
    const userVaultBalance = await client.getUserVaultBalance(
      VAULT_ADDRESS,
      userAddress
    );
    logResult(
      "User vault balance",
      true,
      ethers.formatEther(userVaultBalance) + " shares"
    );

    // Get user allowance for vault
    const userAllowance = await client.getUserAllowance(
      assetAddress,
      userAddress,
      VAULT_ADDRESS
    );
    logResult(
      "User allowance for vault",
      true,
      ethers.formatEther(userAllowance) + " tokens"
    );

    // Check if user is whitelisted (if vault is private)
    const isPrivate = await client.isVaultPrivate(VAULT_ADDRESS);
    if (isPrivate) {
      const isWhitelisted = await client.isAddressWhitelisted(
        VAULT_ADDRESS,
        userAddress
      );
      logResult("User is whitelisted", true, isWhitelisted.toString());
    } else {
      logResult("User whitelist check", true, "N/A - Vault is public");
    }

    // =============================================
    // 3. Administrative Information
    // =============================================
    logTitle("Administrative Information");

    // Check if vault has deposit limit
    const hasLimit = await client.isDepositLimitEnabled(VAULT_ADDRESS);
    logResult("Deposit limit enabled", true, hasLimit.toString());

    if (hasLimit) {
      // Get deposit limit
      const depositLimit = await client.getVaultDepositLimit(VAULT_ADDRESS);
      logResult(
        "Deposit limit",
        true,
        ethers.formatEther(depositLimit) + " tokens"
      );
    }

    // Check if vault is private
    logResult("Vault is private", true, isPrivate.toString());

    // =============================================
    // 4. Shares Information
    // =============================================
    logTitle("Shares Information");

    // Check if shares are tokenized
    const isTokenized = await client.isSharesTokenized(VAULT_ADDRESS);
    logResult("Shares are tokenized", true, isTokenized.toString());

    // Get shares token name
    const sharesName = await client.getSharesName(VAULT_ADDRESS);
    logResult("Shares token name", true, sharesName);

    // Get shares token symbol
    const sharesSymbol = await client.getSharesSymbol(VAULT_ADDRESS);
    logResult("Shares token symbol", true, sharesSymbol);

    // Get total supply of shares
    const totalShares = await client.getTotalShares(VAULT_ADDRESS);
    logResult(
      "Total shares supply",
      true,
      ethers.formatEther(totalShares) + " shares"
    );

    // Get user's shares balance using the new function
    const userShares = await client.getSharesBalance(
      VAULT_ADDRESS,
      userAddress
    );
    logResult(
      "User shares balance",
      true,
      ethers.formatEther(userShares) + " shares"
    );

    // Test conversion of assets to shares
    const testAmount = ethers.parseEther("1.0");
    const sharesAmount = await client.convertToShares(
      VAULT_ADDRESS,
      testAmount
    );
    logResult(
      "1 token converts to",
      true,
      ethers.formatEther(sharesAmount) + " shares"
    );

    // Test conversion of shares to assets
    const testShares = ethers.parseEther("1.0");
    const assetsAmount = await client.convertToAssets(
      VAULT_ADDRESS,
      testShares
    );
    logResult(
      "1 share converts to",
      true,
      ethers.formatEther(assetsAmount) + " tokens"
    );
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
