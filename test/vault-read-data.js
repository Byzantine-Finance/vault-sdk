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
 * 5. Protocol-specific Information - EigenLayer or Symbiotic specific data
 */

const { ethers } = require("ethers");
const { ByzantineClient, DelegatorType } = require("../dist");
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
  const vaultAddress = "0x328a466c68c8f6becde42f36889cbd6727f8abec";
  const VAULT_ADDRESS = vaultAddress.toLowerCase();

  console.log("Network:", networkConfig.name, `(Chain ID: ${chainId})`);
  console.log("User address:", userAddress);
  console.log("Vault address:", VAULT_ADDRESS);

  try {
    // =============================================
    // 1. Basic Vault Information
    // =============================================
    logTitle("Basic Vault Information");

    // Get vault type
    const vaultType = await client.getVaultType(VAULT_ADDRESS);
    logResult("Vault type", true, vaultType || "Very likely to not be a vault");

    if (!vaultType) {
      throw new Error("Vault type not found");
    }

    // Get vault asset address
    const assetAddress = await client.getVaultAsset(VAULT_ADDRESS);
    logResult("Vault asset address", true, assetAddress);
    // Create flags for protocol tests
    const isSymbiotic = vaultType === "Symbiotic" || vaultType === "Supervault";
    const isEigenLayer =
      vaultType === "EigenLayer" || vaultType === "Supervault";

    // Get vault TVL (Total Value Locked)
    const tvl = await client.getVaultTVL(VAULT_ADDRESS);
    logResult("Vault TVL", true, ethers.formatEther(tvl) + " tokens");

    // =============================================
    // 2. Protocol-specific Information
    // =============================================

    // EigenLayer Tests
    if (isEigenLayer) {
      logTitle("EigenLayer Information");

      try {
        const eigenOperator = await client.getEigenOperator(VAULT_ADDRESS);
        logResult("Eigen Operator", true, eigenOperator);
      } catch (error) {
        logResult("Eigen Operator", false, "Failed to get operator");
      }
    }

    // Symbiotic Tests
    if (isSymbiotic) {
      logTitle("Symbiotic Information");

      const delegatorType = Number(
        await client.getDelegatorType(VAULT_ADDRESS)
      );
      logResult("Delegator Type", true, delegatorType);

      try {
        // Get important addresses for Symbiotic vaults
        try {
          const symVaultAddress = await client.getSymVaultAddress(
            VAULT_ADDRESS
          );
          logResult("SymVault Address", true, symVaultAddress);

          const burnerAddress = await client.getBurnerAddress(VAULT_ADDRESS);
          logResult("Burner Address", true, burnerAddress);

          const delegatorAddress = await client.getDelegatorAddress(
            VAULT_ADDRESS
          );
          logResult("Delegator Address", true, delegatorAddress);

          const slasherAddress = await client.getSlasherAddress(VAULT_ADDRESS);
          logResult("Slasher Address", true, slasherAddress);

          try {
            const delegatorOperator = await client.getDelegatorOperator(
              VAULT_ADDRESS
            );
            logResult("Delegator Operator", true, "-> " + delegatorOperator);
          } catch (error) {
            logResult("Delegator Operator", false, error.message);
          }

          try {
            const delegatorNetwork = await client.getDelegatorNetwork(
              VAULT_ADDRESS
            );
            logResult("Delegator Network", true, "-> " + delegatorNetwork);
          } catch (error) {
            logResult("Delegator Network", false, error.message);
          }
        } catch (error) {
          logResult(
            "Symbiotic addresses",
            false,
            "Failed to get Symbiotic addresses"
          );
        }

        // Get epoch at a specific timestamp
        const epoch = await client.getEpochAt(
          VAULT_ADDRESS,
          new Date().getTime() + 1000 * 60 * 60 * 24
        );
        logResult("Epoch at timestamp", true, epoch.toString());

        // Get epoch duration
        const epochDuration = await client.getEpochDuration(VAULT_ADDRESS);
        logResult(
          "Epoch duration",
          true,
          `${epochDuration.toString()} seconds -> ${
            epochDuration.toString() / 60 / 60 / 24
          } days`
        );

        // Get current epoch
        const currentEpoch = await client.getCurrentEpoch(VAULT_ADDRESS);
        logResult("Current epoch", true, currentEpoch.toString());

        // Get current epoch start
        const currentEpochStart = await client.getCurrentEpochStart(
          VAULT_ADDRESS
        );
        logResult("Current epoch start", true, currentEpochStart.toString());

        // Get previous epoch start
        const previousEpochStart = await client.getPreviousEpochStart(
          VAULT_ADDRESS
        );
        logResult("Previous epoch start", true, previousEpochStart.toString());

        // Get next epoch start
        const nextEpochStart = await client.getNextEpochStart(VAULT_ADDRESS);
        logResult("Next epoch start", true, nextEpochStart.toString());
      } catch (error) {
        logResult(
          "Symbiotic epoch functions",
          false,
          "Failed to get epoch information"
        );
      }
    }

    // =============================================
    // 3. User-specific Information
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
    // 4. Administrative Information
    // =============================================
    logTitle("Administrative Information");

    // Check if vault has deposit limit
    const hasLimit = await client.isDepositLimitEnabled(VAULT_ADDRESS);
    logResult("Deposit limit enabled", true, hasLimit.toString());

    // Get deposit limit
    const depositLimit = await client.getVaultDepositLimit(VAULT_ADDRESS);
    logResult(
      "Deposit limit",
      true,
      ethers.formatEther(depositLimit) + " tokens"
    );

    const curatorFee = await client.getCuratorFee(VAULT_ADDRESS);
    logResult("Curator fee", true, curatorFee.toString() / 100 + "%");

    // Check if vault is private
    logResult("Vault is private", true, isPrivate.toString());

    // =============================================
    // 5. Shares Information
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
