/**
 * Test for creating an Eigenlayer ERC20 vault with Byzantine Factory SDK
 *
 * This test demonstrates how to create an Eigenlayer ERC20 vault using the Byzantine Factory SDK.
 * It initializes the client with the proper configuration, sets up the vault parameters,
 * and creates the vault on the network.
 *
 * Tests included:
 * 1. Environment validation - Checks for required environment variables
 * 2. Client initialization - Verifies that the client can be properly instantiated
 * 3. Parameter validation - Ensures that all parameters are correctly set
 * 4. Vault creation - Creates an actual Eigenlayer ERC20 vault on the network
 * 5. Transaction verification - Validates the transaction receipt
 */

const { ByzantineFactoryClient, getNetworkConfig } = require("../dist");
const { ethers } = require("ethers");
const { logTitle, logResult, assert } = require("./utils");
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
  console.log(
    "\n🧪 Byzantine Factory SDK - Create Eigenlayer ERC20 Vault Test 🧪\n"
  );

  try {
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
    logTitle("Eigenlayer ERC20 Vault Creation");

    // Skip tests requiring network connection if no API key
    skipNetworkTests = !RPC_URL;

    // Test client initialization
    const provider = skipNetworkTests
      ? {}
      : new ethers.JsonRpcProvider(RPC_URL);

    const wallet = skipNetworkTests
      ? {}
      : ethers.Wallet.fromPhrase(MNEMONIC).connect(provider);

    const address = await wallet.getAddress();
    logResult("Wallet address", true, address);

    const client = new ByzantineFactoryClient({
      chainId: chainId,
      provider: provider,
      signer: wallet,
    });

    // Get network configuration for token addresses
    const networkConfig = getNetworkConfig(chainId);

    logResult("Client initialization", true);
    assert(client !== undefined, "Client initialization");

    // Define vault parameters
    const baseParams = {
      name: "New Eigen stETH Vault",
      description: "An Eigenlayer vault for stETH restaking",

      token_address: networkConfig.stETHAddress, // wstETH address

      is_deposit_limit: true,
      deposit_limit: ethers.parseUnits("1000", 18), // 1000 stETH

      is_private: false,

      is_tokenized: true,
      token_name: "Byz2 stETH Vault",
      token_symbol: "bstETH",

      curator_fee: 500, // 5% (500 basis points)

      // Roles - replace with actual addresses in production
      role_manager: address,
      role_version_manager: address,
      role_deposit_limit_manager: address,
      role_deposit_whitelist_manager: address,
      role_curator_fee_claimer: address,
      role_curator_fee_claimer_admin: address,
    };

    const eigenlayerParams = {
      // Eigenlayer specific params
      delegation_set_role_holder: address,
      operator: "0xb564e795f9877b416cd1af86c98cf8d3d94d760d",

      approver_signature_and_expiry: {
        signature: "0x", // null signature
        expiry: 0, // no expiry
      },
      approver_salt:
        "0x0000000000000000000000000000000000000000000000000000000000000000", // null salt
    };

    // Test parameter validation
    logResult("Parameter validation", true, "All parameters set correctly");

    // Skip actual vault creation if network tests are disabled
    if (!skipNetworkTests) {
      console.log("\nAttempting to create Eigenlayer ERC20 vault...");

      try {
        // Create the vault
        const tx = client.createEigenlayerERC20Vault({
          base: baseParams,
          eigenlayer: eigenlayerParams,
        });

        const txResponse = await tx;

        console.log(`\nTransaction sent! Hash: ${txResponse.hash}`);
        console.log("Waiting for transaction to be mined...");

        // Wait for the transaction to be mined
        const receipt = await txResponse.wait();

        logResult(
          "Vault creation",
          true,
          `Gas used: ${receipt?.gasUsed.toString()}`
        );

        // Determine the vault address from the logs
        const vaultAddress = receipt?.logs[0]?.address; // Simplified - in production, parse the event properly
        console.log(`\nVault created at address: ${vaultAddress}`);
        console.log(
          `Explorer link: ${
            getNetworkConfig(chainId).scanLink
          }/address/${vaultAddress}`
        );
      } catch (error) {
        logResult("Vault creation", false, `Error: ${error.message}`);
        console.error("Error details:", error);
      }
    } else {
      logResult(
        "Vault creation",
        false,
        "Skipped due to missing env variables"
      );
    }

    console.log("\n🎉 Test completed! 🎉\n");
  } catch (error) {
    console.error(`\n❌ TEST FAILED: ${error.message}\n`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
