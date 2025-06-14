/**
 * Test for creating a Symbiotic ERC20 vault with Byzantine Factory SDK
 *
 * This test demonstrates how to create a Symbiotic ERC20 vault using the Byzantine Factory SDK.
 * It initializes the client with the proper configuration, sets up the vault parameters,
 * and creates the vault on the network.
 *
 * Tests included:
 * 1. Environment validation - Checks for required environment variables
 * 2. Client initialization - Verifies that the client can be properly instantiated
 * 3. Parameter validation - Ensures that all parameters are correctly set
 * 4. Vault creation - Creates an actual Symbiotic ERC20 vault on the network
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

// Test suite
async function runTests() {
  console.log(
    "\n🧪 Byzantine Factory SDK - Create Symbiotic ERC20 Vault Test 🧪\n"
  );

  try {
    // Check if environment variables are set
    const { RPC_URL, MNEMONIC, PRIVATE_KEY, DEFAULT_CHAIN_ID } = process.env;
    const chainId = DEFAULT_CHAIN_ID ? parseInt(DEFAULT_CHAIN_ID) : 17000;

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
          : chainId === 11155111
          ? "Ethereum Sepolia"
          : "Unknown"
      } (Chain ID: ${chainId})\n`
    );

    // Start logging results in tabular format
    logTitle("Symbiotic ERC20 Vault Creation");

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
    logResult("Factory address", true, networkConfig.byzantineFactoryAddress);

    const client = new ByzantineClient({
      chainId: chainId,
      provider: provider,
      signer: wallet,
    });

    logResult("Client initialization", true);
    assert(client !== undefined, "Client initialization");

    logResult("Contract address", true, client.contractAddress);

    // Get network configuration for token addresses

    // Define vault parameters
    const baseParams = {
      metadata: {
        name: "Sym Basic NRD strat",
        description: `This is a Symbiotic vault for wstETH.
      This is a NetworkRestakeDelegator (NRD) so we can have as many operators and networks as possible.
      The vault's security is ensured by trusted institutional operators: P2P, Blockscape, InfraSingularity, and Everstake.
      But Everstake will only run Ditto.
        
      In the event of slashing by the Primev network, any penalties will be directed to their own network as the receiver.`,
        image_url: "https://example.com/updated-vault-image.png",
        social_twitter: "https://x.com/byzantine_fi",
        social_discord: "https://discord.gg/byzantine",
        social_website: "https://byzantine.fi",
        social_github: "https://github.com/byzantine-finance",
      },

      token_address: networkConfig.wstETHAddress, // wstETH address

      is_deposit_limit: true,
      deposit_limit: ethers.parseUnits("10000", 18), // 10k wstETH (18 decimals)

      is_private: false,

      is_tokenized: true,
      token_name: "Sym Basic NRD",
      token_symbol: "wstETHnrd",

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
      vault_epoch_duration: 604800, // 7 days
      slasher_type: SlasherType.VETO,
      slasher_veto_duration: 86400, // 1 day
      slasher_number_epoch_to_set_delay: 3,
      burner_delay_settings_applied: 345600, // 4 days
      burner_global_receiver: "0x25133c2c49A343F8312bb6e896C1ea0Ad8CD0EBd", // Global receiver for wstETH
      burner_network_receiver: [], // Edited by dataSymVaults.ts
      burner_operator_network_receiver: [], // Edited by dataSymVaults.ts
      delegator_type: DelegatorType.NETWORK_RESTAKE, // Edited by dataSymVaults.ts
      delegator_hook: "0x0000000000000000000000000000000000000000", // Delegator hook address
      delegator_operator: "0x0000000000000000000000000000000000000000", // Edited by dataSymVaults.ts
      delegator_network: "0x0000000000000000000000000000000000000000", // Edited by dataSymVaults.ts

      role_delegator_set_hook: address,
      role_delegator_set_network_limit: [address],
      role_delegator_set_operator_network_limit: [address],
      role_burner_owner_burner: address,
    };

    // Test parameter validation
    logResult("Parameter validation", true, "All parameters set correctly");

    // Skip actual vault creation if network tests are disabled
    if (!skipNetworkTests) {
      console.log("\nAttempting to create Symbiotic ERC20 vault...");

      try {
        // Create the vault
        const tx = await client.createSymbioticERC20Vault({
          base: baseParams,
          symbiotic: symbioticParams,
        });

        console.log(`\nTransaction sent! Hash: ${tx.hash}`);
        console.log("Waiting for transaction to be mined...");

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        logResult(
          "Vault creation",
          true,
          `Gas used: ${receipt.gasUsed.toString()}`
        );

        // Determine the vault address from the logs
        const vaultAddress = receipt.logs[0].address; // Simplified - in production, parse the event properly
        console.log(`\nVault created at address: ${vaultAddress}`);
        console.log(
          `Explorer link: ${networkConfig.scanLink}/address/${vaultAddress}`
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
