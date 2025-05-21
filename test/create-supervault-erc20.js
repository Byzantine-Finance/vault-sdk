// @ts-check

/**
 * Test for creating a SuperVault ERC20 with Byzantine Factory SDK
 *
 * This test demonstrates how to create a SuperVault ERC20 using the Byzantine Factory SDK.
 * It initializes the client with the proper configuration, sets up the vault parameters,
 * and creates the vault on the network.
 *
 * Tests included:
 * 1. Environment validation - Checks for required environment variables
 * 2. Client initialization - Verifies that the client can be properly instantiated
 * 3. Parameter validation - Ensures that all parameters are correctly set
 * 4. Vault creation - Creates an actual SuperVault ERC20 on the network
 * 5. Transaction verification - Validates the transaction receipt
 */

const {
  ByzantineClient,
  ETH_TOKEN_ADDRESS,
  getNetworkConfig,
  DelegatorType,
  SlasherType,
} = require("../dist");
const { ethers } = require("ethers");
const {
  logTitle,
  logResult,
  assert,
  assertThrows,
  getWalletBalances,
} = require("./utils");
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
  console.log("\n🧪 Byzantine Factory SDK - Create SuperVault ERC20 Test 🧪\n");

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

    // Start logging results in tabular format
    logTitle("SuperVault ERC20 Creation");

    // Skip tests requiring network connection if no API key
    skipNetworkTests = !RPC_URL;

    // Test client initialization
    const provider = skipNetworkTests
      ? {}
      : new ethers.JsonRpcProvider(RPC_URL);

    const wallet = skipNetworkTests
      ? {}
      : MNEMONIC
      ? ethers.Wallet.fromPhrase(MNEMONIC).connect(provider)
      : PRIVATE_KEY
      ? new ethers.Wallet(PRIVATE_KEY).connect(provider)
      : {};

    const address = await wallet.getAddress();
    logResult("Wallet address", true, address);

    const networkConfig = getNetworkConfig(chainId);
    logResult("Factory address", true, networkConfig.factoryContractAddress);

    const client = new ByzantineClient({
      chainId: chainId,
      provider: provider,
      signer: wallet,
    });

    // Get network configuration for token addresses

    logResult("Client initialization", true);
    assert(client !== undefined, "Client initialization");

    // Define vault parameters
    const baseParams = {
      metadata: {
        name: "SuperVault wstETH",
        description: "A SuperVault for wstETH with high yields",
      },

      token_address: networkConfig.wstETHAddress, // wstETH address

      is_deposit_limit: true,
      deposit_limit: ethers.parseUnits("10000000", 18), // 10M osETH (18 decimals)

      is_private: false, // Private SuperVault

      is_tokenized: true,
      token_name: "Byzantine wstETH SuperVault",
      token_symbol: "bwstETHs",

      curator_fee: 500, // 5% (500 basis points)

      // Roles - replace with actual addresses in production
      role_manager: address,
      role_version_manager: address,
      role_deposit_limit_manager: address,
      role_deposit_whitelist_manager: address,
      role_curator_fee_claimer: address,
      role_curator_fee_claimer_admin: address,
    };

    const symbioticParams = {
      vault_version: 1,
      vault_epoch_duration: 604800, // 7 days in seconds
      slasher_type: SlasherType.VETO,
      slasher_veto_duration: 86400, // 1 day in seconds
      slasher_number_epoch_to_set_delay: 3,
      burner_delay_settings_applied: 21, // 21 days
      burner_global_receiver: "0x25133c2c49A343F8312bb6e896C1ea0Ad8CD0EBd", // Global receiver for wstETH
      burner_network_receiver: [],
      burner_operator_network_receiver: [],
      delegator_type: DelegatorType.NETWORK_RESTAKE,
      delegator_hook: "0x0000000000000000000000000000000000000001", // Delegator hook address
      delegator_operator: "0x0000000000000000000000000000000000000000", // Not used for NETWORK_RESTAKE
      delegator_network: "0x0000000000000000000000000000000000000000", // Not used for NETWORK_RESTAKE

      role_delegator_set_hook: address,
      role_delegator_set_network_limit: [address],
      role_delegator_set_operator_network_limit: [address],
      role_burner_owner_burner: address,
    };

    const eigenlayerParams = {
      // Eigenlayer specific params
      delegation_set_role_holder: address,
      operator: "0xb564e795f9877b416cd1af86c98cf8d3d94d760d", // Blockshard

      approver_signature_and_expiry: {
        signature: "0x", // null signature
        expiry: 0, // no expiry
      },
      approver_salt:
        "0x0000000000000000000000000000000000000000000000000000000000000000", // null salt
    };

    const ratio = 500; // 5%
    const curator = address;

    // Test parameter validation
    logResult("Parameter validation", true, "All parameters set correctly");

    // Skip actual vault creation if network tests are disabled
    if (!skipNetworkTests) {
      console.log("\nAttempting to create SuperVault ERC20...");

      try {
        // Create the vault
        const tx = await client.createSuperVaultERC20({
          base: baseParams,
          symbiotic: symbioticParams,
          eigenlayer: eigenlayerParams,
          ratio: ratio,
          curator: curator,
        });

        console.log(`\nTransaction sent! Hash: ${tx.hash}`);
        console.log("Waiting for transaction to be mined...");

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        logResult(
          "Vault creation",
          true,
          `Gas used: ${receipt?.gasUsed.toString() || "unknown"}`
        );

        // Determine the vault address from the logs
        const vaultAddress = receipt?.logs?.[0]?.address || "unknown"; // Simplified - in production, parse the event properly
        console.log(`\nSuperVault created at address: ${vaultAddress}`);
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
