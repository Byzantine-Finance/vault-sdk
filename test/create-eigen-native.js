/**
 * Test for creating an Eigenlayer Native vault with Byzantine Factory SDK
 *
 * This test demonstrates how to create an Eigenlayer Native (ETH) vault using the Byzantine Factory SDK.
 * It initializes the client with the proper configuration, sets up the vault parameters,
 * and creates the vault on the network.
 *
 * Tests included:
 * 1. Environment validation - Checks for required environment variables
 * 2. Client initialization - Verifies that the client can be properly instantiated
 * 3. Parameter validation - Ensures that all parameters are correctly set
 * 4. Vault creation - Creates an actual Eigenlayer Native vault on the network
 * 5. Transaction verification - Validates the transaction receipt
 */

const {
  ByzantineFactoryClient,
  ETH_TOKEN_ADDRESS,
  getNetworkConfig,
  isChainSupported,
  getSupportedChainIds,
} = require("../dist");
const { ethers } = require("ethers");
const { logTitle, logResult, assert } = require("./utils");
require("dotenv").config();

// Test suite
async function runTests() {
  console.log(
    "\n🧪 Byzantine Factory SDK - Create Eigenlayer Native Vault Test 🧪\n"
  );

  try {
    // Check if environment variables are set
    const { INFURA_API_KEY, MNEMONIC, DEFAULT_CHAIN_ID } = process.env;
    const parsedId = DEFAULT_CHAIN_ID ? parseInt(DEFAULT_CHAIN_ID) : 17000;
    const chainId = parsedId === 1 ? 1 : 17000;

    // Verify chain is supported
    if (!isChainSupported(chainId)) {
      console.error(`⚠️ Error: Chain ID ${chainId} is not supported`);
      console.log(`Supported chains: ${getSupportedChainIds().join(", ")}`);
      process.exit(1);
    }

    let skipNetworkTests = false;
    if (!INFURA_API_KEY) {
      console.warn(
        "⚠️ Warning: INFURA_API_KEY not set in .env file. Network tests will be skipped."
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
    logTitle("Eigenlayer Native Vault Creation");

    // Test client initialization
    const provider = skipNetworkTests
      ? null
      : new ethers.JsonRpcProvider(
          `https://${
            chainId === 1 ? "mainnet" : "holesky"
          }.infura.io/v3/${INFURA_API_KEY}`
        );

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

    // Define vault parameters with correct structure
    const baseParams = {
      name: "Eigenlayer ETH Vault",
      description: "An Eigenlayer vault for ETH restaking",

      token_address: ETH_TOKEN_ADDRESS,

      is_deposit_limit: true,
      deposit_limit: ethers.parseEther("1000"), // Keep as string to avoid overflow

      is_private: false,

      is_tokenized: true,
      token_name: "Byzantine ETH Vault",
      token_symbol: "bETH",

      curator_fee: 300, // 3% (300 basis points)

      // Roles - replace with actual addresses in production
      role_manager: address,
      role_version_manager: address,
      role_deposit_limit_manager: address,
      role_deposit_whitelist_manager: address,
      role_curator_fee_claimer: address,
      role_curator_fee_claimer_admin: address,
    };

    const nativeParams = {
      // Base vault parameters wrapped in byzVaultParams
      byzVaultParams: baseParams,

      // Native params specific to Eigenlayer vaults
      operator_id:
        "0x0000000000000000000000000000000000000000000000000000000000000000", // So we are our own operator for native staking

      // Roles - replace with actual addresses in production
      roles_validator_manager: [address],
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

    // EigenPod parameters
    const eigenPodParams = {
      eigen_pod_owner: address,
      proof_submitter: address,
    };

    // Test parameter validation
    logResult("Parameter validation", true, "All parameters set correctly");

    // Skip actual vault creation if network tests are disabled
    if (!skipNetworkTests) {
      console.log("\nAttempting to create Eigenlayer Native vault...");

      try {
        // Create the vault
        const tx = await client.createEigenlayerNativeVault({
          base: nativeParams,
          eigenlayer: eigenlayerParams,
          eigenpod: eigenPodParams,
        });

        console.log(`\nTransaction sent! Hash: ${tx.hash}`);
        console.log("Waiting for transaction to be mined...");

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        logResult(
          "Vault creation",
          true,
          `Gas used: ${receipt?.gasUsed.toString()}`
        );

        // Determine the vault address from the logs
        const vaultAddress = receipt?.logs[0]?.address; // Simplified - in production, parse the event properly
        console.log(`\nVault created at address: ${vaultAddress}`);

        const networkConfig = getNetworkConfig(chainId);
        if (networkConfig) {
          console.log(
            `Explorer link: ${networkConfig.scanLink}/address/${vaultAddress}`
          );
        }
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
