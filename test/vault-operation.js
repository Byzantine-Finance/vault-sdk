/**
 * Byzantine Vault Operations Test
 *
 * This test demonstrates comprehensive interactions with an existing Byzantine vault
 * using the Byzantine Factory SDK. It covers the full lifecycle of vault operations
 * from information retrieval to deposits, withdrawals, and administrative functions.
 *
 * Tests included:
 * 1. Vault Information - Retrieves and displays vault configuration and balances
 * 2. Deposit Functions - Tests both successful and failing deposit scenarios
 * 3. Withdrawal Functions - Tests withdrawing funds from the vault
 * 4. Curator Functions - Tests administrative operations like:
 *    - Deposit limit management
 *    - Whitelist management
 * 5. Shares Information - Tests shares token properties and conversion functions
 * 6. Cleanup - Withdraws all funds from the vault at the end of testing
 */

const { ethers } = require("ethers");
const { ByzantineClient } = require("../dist");
const { getNetworkConfig } = require("../dist/constants");
const {
  logTitle,
  logResult,
  assert,
  assertThrows,
  getWalletBalances,
} = require("./utils");
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
  console.log("\n🧪 Byzantine SDK - Vault Operations Test 🧪\n");

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

  // Start logging results in tabular format
  logTitle("Vault Operations");

  // Skip tests requiring network connection if no API key
  skipNetworkTests = !RPC_URL;

  // Test client initialization
  const provider = skipNetworkTests ? {} : new ethers.JsonRpcProvider(RPC_URL);

  const wallet = skipNetworkTests
    ? {}
    : ethers.Wallet.fromPhrase(MNEMONIC).connect(provider);

  const address = await wallet.getAddress();
  logResult("Wallet address", true, address);

  const client = new ByzantineClient({
    chainId: chainId,
    provider: provider,
    signer: wallet,
  });

  // Get network configuration for token addresses
  const networkConfig = getNetworkConfig(chainId);

  logResult("Client initialization", true);
  assert(client !== undefined, "Client initialization");

  // Test vault and asset addresses
  const VAULT_ADDRESS = "0x1f7cc65ebd5afb3e85b32e5a8a6484afa7811510";
  const ASSET_ADDRESS = networkConfig.stETHAddress;

  console.log("Network:", networkConfig.name, `(Chain ID: ${chainId})`);
  console.log("User address:", userAddress);
  console.log("Vault address:", VAULT_ADDRESS);
  console.log("Asset address:", ASSET_ADDRESS);

  try {
    // =============================================
    // Get information about the vault
    // =============================================
    logTitle("Vault Information");

    // Check if vault has deposit limit
    const hasLimit = await client.isDepositLimitEnabled(VAULT_ADDRESS);
    logResult("Vault has deposit limit", true, hasLimit.toString());

    // Get the deposit limit
    const initialDepositLimit = await client.getVaultDepositLimit(
      VAULT_ADDRESS
    );
    logResult(
      "Vault deposit limit",
      true,
      ethers.formatEther(initialDepositLimit) + " ETH"
    );

    // Check if vault is private
    const isPrivate = await client.isVaultPrivate(VAULT_ADDRESS);
    logResult("Vault is private", true, isPrivate.toString());

    // Get user balance in the vault
    const userVaultBalance = await client.getUserVaultBalance(
      VAULT_ADDRESS,
      userAddress
    );
    logResult(
      "User vault balance",
      true,
      ethers.formatEther(userVaultBalance) + " shares"
    );

    // Get initial wallet balances
    const initialBalances = await getWalletBalances(
      provider,
      userAddress,
      networkConfig
    );
    logResult(
      "User asset balance",
      true,
      initialBalances.stETH.formatted + " " + initialBalances.stETH.symbol
    );

    // Get vault TVL
    const initialTVL = await client.getVaultTVL(VAULT_ADDRESS);
    logResult(
      "Initial vault TVL",
      true,
      ethers.formatEther(initialTVL) + " tokens"
    );

    // =============================================
    // Test deposit functions
    // =============================================
    logTitle("Deposit Functions");

    // Try to deposit a large amount (should fail)
    const largeAmount = ethers.parseEther("100");
    await assertThrows(async () => {
      await client.depositToVault(VAULT_ADDRESS, largeAmount, true);
    }, "Large deposit should fail");

    // Deposit a small amount (should succeed)
    const smallAmount = ethers.parseEther("0.1");
    let depositSuccess = true;

    try {
      const approveTx = await client.approveVault(
        ASSET_ADDRESS,
        VAULT_ADDRESS,
        smallAmount
      );
      await approveTx.wait();

      const depositTx = await client.depositToVault(
        VAULT_ADDRESS,
        smallAmount,
        false
      );
      await depositTx.wait();
    } catch (error) {
      depositSuccess = false;
      console.log("Small deposit failed:", error.message);
    }

    logResult(
      "Deposit small amount",
      depositSuccess,
      ethers.formatEther(smallAmount) + " tokens"
    );

    // Get updated balances and TVL
    const userVaultBalanceAfterDeposit = await client.getUserVaultBalance(
      VAULT_ADDRESS,
      userAddress
    );
    logResult(
      "Vault balance after deposit",
      true,
      ethers.formatEther(userVaultBalanceAfterDeposit) + " shares"
    );

    const balancesAfterDeposit = await getWalletBalances(
      provider,
      userAddress,
      networkConfig
    );
    logResult(
      "Asset balance after deposit",
      true,
      balancesAfterDeposit.stETH.formatted +
        " " +
        balancesAfterDeposit.stETH.symbol
    );

    const tvlAfterDeposit = await client.getVaultTVL(VAULT_ADDRESS);
    logResult(
      "TVL after deposit",
      true,
      ethers.formatEther(tvlAfterDeposit) + " tokens"
    );

    const tvlChange = tvlAfterDeposit - initialTVL;
    // Verify TVL increased if deposit was successful
    if (depositSuccess) {
      assert(tvlChange > 0, "TVL should increase after deposit");
    }
    logResult(
      "TVL change",
      tvlChange > 0,
      ethers.formatEther(tvlChange) + " tokens"
    );

    // =============================================
    // Test withdrawal functions
    // =============================================
    logTitle("Withdrawal Functions");

    // Skip withdrawal if deposit wasn't successful
    if (depositSuccess && userVaultBalanceAfterDeposit > 0) {
      // Withdraw a portion of the deposit
      const withdrawAmount = ethers.parseEther("0.03");
      let withdrawSuccess = true;

      try {
        const withdrawTx = await client.withdrawFromVault(
          VAULT_ADDRESS,
          withdrawAmount
        );
        await withdrawTx.wait();
      } catch (error) {
        withdrawSuccess = false;
        console.log("Withdrawal failed:", error.message);
      }

      logResult(
        "Withdraw tokens",
        withdrawSuccess,
        ethers.formatEther(withdrawAmount) + " tokens"
      );

      // Get updated balance
      const userVaultBalanceAfterWithdraw = await client.getUserVaultBalance(
        VAULT_ADDRESS,
        userAddress
      );
      logResult(
        "Balance after withdrawal",
        true,
        ethers.formatEther(userVaultBalanceAfterWithdraw) + " shares"
      );

      if (withdrawSuccess) {
        assert(
          userVaultBalanceAfterWithdraw < userVaultBalanceAfterDeposit,
          "Balance should decrease after withdrawal"
        );
      }
    } else {
      logResult("Skip withdrawal tests", true, "No funds to withdraw");
    }

    // =============================================
    // Test curator functions
    // =============================================
    logTitle("Curator Functions - Deposit Limits");

    // Change the deposit limit
    const newLimit = ethers.parseEther("400000000");
    let limitChangeSuccess = true;

    try {
      const setLimitTx = await client.setVaultDepositLimit(
        VAULT_ADDRESS,
        newLimit
      );
      await setLimitTx.wait();
    } catch (error) {
      limitChangeSuccess = false;
      console.log("Deposit limit change failed:", error.message);
    }

    logResult(
      "Change deposit limit",
      limitChangeSuccess,
      ethers.formatEther(newLimit) + " tokens"
    );

    // Verify new limit if change was successful
    if (limitChangeSuccess) {
      const updatedLimit = await client.getVaultDepositLimit(VAULT_ADDRESS);
      logResult(
        "Updated deposit limit",
        updatedLimit.toString() === newLimit.toString(),
        ethers.formatEther(updatedLimit) + " tokens"
      );
    }

    // Turn off deposit limit
    let disableLimitSuccess = true;

    try {
      const disableLimitTx = await client.setDepositLimitStatus(
        VAULT_ADDRESS,
        false
      );
      await disableLimitTx.wait();
    } catch (error) {
      disableLimitSuccess = false;
      console.log("Deposit limit disable failed:", error.message);
    }

    logResult("Disable deposit limit", disableLimitSuccess, "");

    // Verify limit is disabled if operation was successful
    if (disableLimitSuccess) {
      const limitStatus = await client.isDepositLimitEnabled(VAULT_ADDRESS);
      assert(!limitStatus, "Deposit limit should be disabled");
      logResult("Limit disabled verification", !limitStatus, "");
    }

    // Try to deposit with limit disabled
    const smallDeposit2 = ethers.parseEther("0.005");
    let depositWithLimitDisabledSuccess = true;

    try {
      const approveTx = await client.approveVault(
        ASSET_ADDRESS,
        VAULT_ADDRESS,
        smallDeposit2
      );
      await approveTx.wait();

      const depositTx = await client.depositToVault(
        VAULT_ADDRESS,
        smallDeposit2,
        false
      );
      await depositTx.wait();
    } catch (error) {
      depositWithLimitDisabledSuccess = false;
      console.log("Deposit with limit disabled failed:", error.message);
    }

    logResult(
      "Deposit with limit disabled",
      depositWithLimitDisabledSuccess,
      ethers.formatEther(smallDeposit2) + " tokens"
    );

    // Turn on deposit limit
    let enableLimitSuccess = true;

    try {
      const enableLimitTx = await client.setDepositLimitStatus(
        VAULT_ADDRESS,
        true
      );
      await enableLimitTx.wait();
    } catch (error) {
      enableLimitSuccess = false;
      console.log("Deposit limit enable failed:", error.message);
    }

    logResult("Enable deposit limit", enableLimitSuccess, "");

    // Verify limit is enabled if operation was successful
    if (enableLimitSuccess) {
      const limitStatus = await client.isDepositLimitEnabled(VAULT_ADDRESS);
      assert(limitStatus, "Deposit limit should be enabled");
      logResult("Limit enabled verification", limitStatus, "");
    }

    // Try to deposit with limit enabled
    const smallDeposit3 = ethers.parseEther("0.03");
    let depositWithLimitEnabledSuccess = true;

    try {
      const approveTx = await client.approveVault(
        ASSET_ADDRESS,
        VAULT_ADDRESS,
        smallDeposit3
      );
      await approveTx.wait();

      const depositTx = await client.depositToVault(
        VAULT_ADDRESS,
        smallDeposit3,
        false
      );
      await depositTx.wait();
    } catch (error) {
      depositWithLimitEnabledSuccess = false;
      console.log("Deposit with limit enabled failed:", error.message);
    }

    logResult(
      "Deposit with limit enabled",
      depositWithLimitEnabledSuccess,
      ethers.formatEther(smallDeposit3) + " tokens"
    );

    // =============================================
    // Test whitelist functions
    // =============================================
    logTitle("Curator Functions - Whitelist");

    // Check if vault is private - Only test whitelist for private vaults
    const isVaultPrivate = await client.isVaultPrivate(VAULT_ADDRESS);

    if (!isVaultPrivate) {
      logResult(
        "Skip whitelist tests",
        true,
        "Vault is not private, whitelist functions not applicable"
      );
      console.log(
        "\nInfo: Whitelist tests are only relevant for private vaults. The current vault is public."
      );
    } else {
      // Generate a random address to whitelist
      const randomWallet = ethers.Wallet.createRandom();
      const randomAddress = randomWallet.address;
      logResult("Random address generated", true, randomAddress);

      // Add address to whitelist
      let whitelistSuccess = true;

      try {
        const whitelistTx = await client.setAddressesWhitelistStatus(
          VAULT_ADDRESS,
          [randomAddress],
          true
        );
        await whitelistTx.wait();
      } catch (error) {
        whitelistSuccess = false;
        console.log("Whitelisting failed:", error.message);
      }

      logResult("Add address to whitelist", whitelistSuccess, "");

      // Check if address is whitelisted if operation was successful
      if (whitelistSuccess) {
        const isWhitelisted1 = await client.isAddressWhitelisted(
          VAULT_ADDRESS,
          randomAddress
        );
        assert(isWhitelisted1, "Address should be whitelisted");
        logResult("Whitelist verification", isWhitelisted1, "");
      }

      // Remove address from whitelist
      let removeFromWhitelistSuccess = true;

      try {
        const removeWhitelistTx = await client.setAddressesWhitelistStatus(
          VAULT_ADDRESS,
          [randomAddress],
          false
        );
        await removeWhitelistTx.wait();
      } catch (error) {
        removeFromWhitelistSuccess = false;
        console.log("Whitelist removal failed:", error.message);
      }

      logResult(
        "Remove address from whitelist",
        removeFromWhitelistSuccess,
        ""
      );

      // Check if address is still whitelisted if removal was successful
      if (removeFromWhitelistSuccess) {
        const isWhitelisted2 = await client.isAddressWhitelisted(
          VAULT_ADDRESS,
          randomAddress
        );
        assert(!isWhitelisted2, "Address should not be whitelisted");
        logResult("Whitelist removal verification", !isWhitelisted2, "");
      }
    }

    // =============================================
    // Test shares functions
    // =============================================
    logTitle("Shares Information");

    // Check if the vault's shares are tokenized
    const isTokenized = await client.isSharesTokenized(VAULT_ADDRESS);
    logResult("Shares are tokenized", true, isTokenized.toString());

    // Get shares token name and symbol
    const sharesName = await client.getSharesName(VAULT_ADDRESS);
    const sharesSymbol = await client.getSharesSymbol(VAULT_ADDRESS);
    logResult("Shares token name", true, sharesName);
    logResult("Shares token symbol", true, sharesSymbol);

    // Get total supply of shares
    const totalShares = await client.getTotalShares(VAULT_ADDRESS);
    logResult(
      "Total shares supply",
      true,
      ethers.formatEther(totalShares) + " shares"
    );

    // Get user's shares balance
    const userShares = await client.getSharesBalance(
      VAULT_ADDRESS,
      userAddress
    );
    logResult(
      "User shares balance",
      true,
      ethers.formatEther(userShares) + " shares"
    );

    // Test conversion between assets and shares
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

    const assetsAmount = await client.convertToAssets(
      VAULT_ADDRESS,
      sharesAmount
    );
    const conversionDiff =
      (Number(ethers.formatEther(assetsAmount)) /
        Number(ethers.formatEther(testAmount)) -
        1) *
      100;
    logResult(
      "Conversion roundtrip difference",
      Math.abs(conversionDiff) < 0.1, // Less than 0.1% difference
      conversionDiff.toFixed(6) + "%"
    );

    // Verify that user's shares balance matches the vault balance function
    const userVaultShares = await client.getUserVaultBalance(
      VAULT_ADDRESS,
      userAddress
    );
    const sharesMatch = userShares.toString() === userVaultShares.toString();
    logResult(
      "Shares balance consistency check",
      sharesMatch,
      `${ethers.formatEther(userShares)} = ${ethers.formatEther(
        userVaultShares
      )}`
    );

    // =============================================
    // Withdraw all funds and clean up
    // =============================================
    logTitle("Clean Up");

    // Restore initial deposit limit
    let restoreLimitSuccess = true;
    try {
      // Re-enable deposit limit if it was disabled
      if (!(await client.isDepositLimitEnabled(VAULT_ADDRESS))) {
        const enableLimitTx = await client.setDepositLimitStatus(
          VAULT_ADDRESS,
          true
        );
        await enableLimitTx.wait();
        logResult("Re-enable deposit limit", true, "");
      }

      // Restore the original deposit limit value
      const setLimitTx = await client.setVaultDepositLimit(
        VAULT_ADDRESS,
        initialDepositLimit
      );
      await setLimitTx.wait();
    } catch (error) {
      restoreLimitSuccess = false;
      console.log("Restoring initial deposit limit failed:", error.message);
    }

    logResult(
      "Restore initial deposit limit",
      restoreLimitSuccess,
      ethers.formatEther(initialDepositLimit) + " tokens"
    );

    // Verify deposit limit was restored
    if (restoreLimitSuccess) {
      const restoredLimit = await client.getVaultDepositLimit(VAULT_ADDRESS);
      logResult(
        "Deposit limit verification",
        restoredLimit.toString() === initialDepositLimit.toString(),
        ethers.formatEther(restoredLimit) + " tokens"
      );
    }

    // Get final user balance
    const finalUserVaultBalance = await client.getUserVaultBalance(
      VAULT_ADDRESS,
      userAddress
    );
    logResult(
      "Final vault balance",
      true,
      ethers.formatEther(finalUserVaultBalance) + " shares"
    );

    // Withdraw all funds if there's any balance
    if (finalUserVaultBalance > 0) {
      let fullWithdrawalSuccess = true;

      try {
        const withdrawAllTx = await client.redeemSharesFromVault(
          VAULT_ADDRESS,
          finalUserVaultBalance
        );
        await withdrawAllTx.wait();
      } catch (error) {
        fullWithdrawalSuccess = false;
        console.log("Full withdrawal failed:", error.message);
      }

      logResult(
        "Withdraw all funds",
        fullWithdrawalSuccess,
        ethers.formatEther(finalUserVaultBalance) + " shares"
      );

      // Verify final balance if withdrawal was successful
      if (fullWithdrawalSuccess) {
        const verificationBalance = await client.getUserVaultBalance(
          VAULT_ADDRESS,
          userAddress
        );
        assert(
          verificationBalance < ethers.parseEther("0.001"),
          "Balance should be nearly zero after full withdrawal"
        );
        logResult(
          "Balance after full withdrawal",
          verificationBalance < ethers.parseEther("0.001"),
          ethers.formatEther(verificationBalance) + " shares"
        );
      }
    } else {
      logResult("Skip full withdrawal", true, "No funds to withdraw");
    }

    // Get final wallet balances for comparison
    const finalBalances = await getWalletBalances(
      provider,
      userAddress,
      networkConfig
    );
    logResult(
      "Final asset balance",
      true,
      finalBalances.stETH.formatted + " " + finalBalances.stETH.symbol
    );

    console.log("\n🎉 Test completed successfully! 🎉");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Execute the test
runTests().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
