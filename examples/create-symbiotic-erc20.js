/**
 * Example: Create a Symbiotic ERC20 Vault
 *
 * This example demonstrates how to create a Symbiotic ERC20 vault using the Byzantine Factory SDK.
 * It shows how to:
 * 1. Initialize the client with ethers.js
 * 2. Set up proper vault parameters including the symbiotic-specific parameters
 * 3. Execute the vault creation transaction
 */

const {
  ByzantineFactoryClient,
  ETH_TOKEN_ADDRESS,
  DelegatorType,
  SlasherType,
} = require("../dist");
const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  // Check environment variables
  const { INFURA_API_KEY, MNEMONIC, DEFAULT_CHAIN_ID } = process.env;

  if (!INFURA_API_KEY || !MNEMONIC) {
    console.error(
      "Error: INFURA_API_KEY and MNEMONIC must be set in .env file"
    );
    process.exit(1);
  }

  const chainId = DEFAULT_CHAIN_ID ? parseInt(DEFAULT_CHAIN_ID) : 17000; // Default to Holesky if not set

  console.log(
    `Using network: ${chainId === 1 ? "Ethereum Mainnet" : "Holesky Testnet"}`
  );

  // Initialize provider and wallet
  const provider = new ethers.JsonRpcProvider(
    `https://${
      chainId === 1 ? "mainnet" : "holesky"
    }.infura.io/v3/${INFURA_API_KEY}`
  );

  const wallet = ethers.Wallet.fromPhrase(MNEMONIC).connect(provider);
  console.log(`Using wallet address: ${wallet.address}`);

  try {
    // Initialize Byzantine Factory client
    const client = new ByzantineFactoryClient({
      chainId: chainId,
      provider: provider,
      signer: wallet,
    });

    console.log(`Connected to Byzantine Factory at: ${client.contractAddress}`);

    // Define Symbiotic ERC20 vault parameters
    const baseParams = {
      name: "Symbiotic wstETH Vault",
      description: "A Symbiotic vault for wstETH restaking",

      token_address: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", // wstETH address

      is_deposit_limit: true,
      deposit_limit: ethers.parseUnits("500", 18).toString(), // 500 wstETH

      is_private: false,

      is_tokenized: true,
      token_name: "Byzantine wstETH Symbiotic Vault",
      token_symbol: "bwstETHs",

      curator_fee: 200, // 2% (200 basis points)

      // Roles - replace with actual addresses in production
      role_manager: wallet.address,
      role_version_manager: wallet.address,
      role_deposit_limit_manager: wallet.address,
      role_deposit_whitelist_manager: wallet.address,
      role_curator_fee_claimer: wallet.address,
      role_curator_fee_claimer_admin: wallet.address,
    };

    const symbioticParams = {
      vault_version: 1,
      vault_epoch_duration: 86400, // 24 hours in seconds
      slasher_type: SlasherType.VETO, // Using VETO slasher type
      slasher_veto_duration: 604800, // 7 days in seconds
      slasher_number_epoch_to_set_delay: 3,
      burner_delay_settings_applied: 21, // 21 days
      burner_global_receiver: "0x3333333333333333333333333333333333333333", // Global burner receiver address
      burner_network_receiver: [],
      burner_operator_network_receiver: [],
      delegator_type: DelegatorType.NETWORK_RESTAKE, // Using NETWORK_RESTAKE delegator type
      delegator_hook: "0x4444444444444444444444444444444444444444", // Delegator hook address
      delegator_operator: "0x0000000000000000000000000000000000000000", // Not used for NETWORK_RESTAKE
      delegator_network: "0x0000000000000000000000000000000000000000", // Not used for NETWORK_RESTAKE

      role_delegator_set_hook: wallet.address,
      role_delegator_set_network_limit: [wallet.address],
      role_delegator_set_operator_network_limit: [wallet.address],
      role_burner_owner_burner: wallet.address,
    };

    console.log("\nCreating Symbiotic ERC20 vault with parameters:");
    console.log("Token:", baseParams.token_address);
    console.log(
      "Deposit limit:",
      ethers.formatUnits(BigInt(baseParams.deposit_limit), 18),
      "wstETH"
    );
    console.log("Curator fee:", baseParams.curator_fee / 100, "%");
    console.log(
      "Delegator type:",
      getDelegatorTypeName(symbioticParams.delegator_type)
    );
    console.log(
      "Slasher type:",
      getSlasherTypeName(symbioticParams.slasher_type)
    );
    console.log(
      "Epoch duration:",
      symbioticParams.vault_epoch_duration / 3600,
      "hours"
    );

    // Create the vault
    console.log("\nSending transaction...");
    const tx = await client.createSymbioticERC20Vault({
      base: baseParams,
      symbiotic: symbioticParams,
    });

    console.log(`Transaction sent! Hash: ${tx.hash}`);
    console.log("Waiting for transaction to be mined...");

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log(
      `Transaction confirmed! Gas used: ${receipt.gasUsed.toString()}`
    );

    // In a real implementation, you would extract the vault address from the event logs
    // For this example, we're using a simplified approach
    const vaultAddress = receipt.logs[0].address;
    console.log(`\nVault created at address: ${vaultAddress}`);

    console.log("\nSymbiotic ERC20 vault creation completed successfully!");
  } catch (error) {
    console.error("Error creating vault:", error);
    process.exit(1);
  }
}

// Helper functions to get human-readable names for enum values
function getDelegatorTypeName(delegatorType) {
  switch (delegatorType) {
    case DelegatorType.NETWORK_RESTAKE:
      return "Network Restake";
    case DelegatorType.FULL_RESTAKE:
      return "Full Restake";
    case DelegatorType.OPERATOR_SPECIFIC:
      return "Operator Specific";
    case DelegatorType.OPERATOR_NETWORK_SPECIFIC:
      return "Operator Network Specific";
    default:
      return "Unknown";
  }
}

function getSlasherTypeName(slasherType) {
  switch (slasherType) {
    case SlasherType.INSTANT:
      return "Instant";
    case SlasherType.VETO:
      return "Veto";
    default:
      return "Unknown";
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
