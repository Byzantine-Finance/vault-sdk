// @ts-check

/**
 * Example: Create a SuperVault ERC20
 *
 * This example demonstrates how to create a SuperVault ERC20 using the Byzantine Factory SDK.
 * It shows how to:
 * 1. Initialize the client with ethers.js
 * 2. Set up proper vault parameters including the symbiotic-specific parameters
 * 3. Execute the vault creation transaction
 *
 * A SuperVault is a special type of vault with advanced features and typically higher curator fees.
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
  const { RPC_URL, MNEMONIC, DEFAULT_CHAIN_ID } = process.env;

  if (!RPC_URL || !MNEMONIC) {
    console.error("Error: RPC_URL and MNEMONIC must be set in .env file");
    process.exit(1);
  }

  const parsedId = DEFAULT_CHAIN_ID ? parseInt(DEFAULT_CHAIN_ID) : 17000;
  const chainId = parsedId === 1 ? 1 : 17000;

  console.log(
    `Using network: ${chainId === 1 ? "Ethereum Mainnet" : "Holesky Testnet"}`
  );

  // Initialize provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);

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

    // Define SuperVault ERC20 parameters
    const baseParams = {
      name: "SuperVault USDC",
      description: "A SuperVault for USDC with high yields",

      token_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC address (mainnet)

      is_deposit_limit: true,
      deposit_limit: ethers.parseUnits("1000000", 6), // 1M USDC (6 decimals)

      is_private: true, // Private SuperVault

      is_tokenized: true,
      token_name: "Byzantine USDC SuperVault",
      token_symbol: "bUSDCs",

      curator_fee: 1000, // 10% (1000 basis points)

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
      vault_epoch_duration: 43200, // 12 hours in seconds
      slasher_type: SlasherType.INSTANT, // Using INSTANT slasher type
      slasher_veto_duration: 0, // Not used for INSTANT slasher
      slasher_number_epoch_to_set_delay: 2,
      burner_delay_settings_applied: 14, // 14 days
      burner_global_receiver: "0x5555555555555555555555555555555555555555", // Global burner receiver address
      burner_network_receiver: [],
      burner_operator_network_receiver: [],
      delegator_type: DelegatorType.FULL_RESTAKE, // Using FULL_RESTAKE delegator type
      delegator_hook: "0x6666666666666666666666666666666666666666", // Delegator hook address
      delegator_operator: "0x0000000000000000000000000000000000000000", // Not used for FULL_RESTAKE
      delegator_network: "0x0000000000000000000000000000000000000000", // Not used for FULL_RESTAKE

      role_delegator_set_hook: wallet.address,
      role_delegator_set_network_limit: [wallet.address],
      role_delegator_set_operator_network_limit: [wallet.address],
      role_burner_owner_burner: wallet.address,
    };

    console.log("\nCreating SuperVault ERC20 with parameters:");
    console.log("Token:", baseParams.token_address);
    console.log(
      "Deposit limit:",
      ethers.formatUnits(BigInt(baseParams.deposit_limit), 6),
      "USDC"
    );
    console.log("Curator fee:", baseParams.curator_fee / 100, "%");
    console.log("Is private:", baseParams.is_private ? "Yes" : "No");
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
    const tx = await client.createSuperVaultERC20({
      base: baseParams,
      symbiotic: symbioticParams,
    });

    console.log(`Transaction sent! Hash: ${tx.hash}`);
    console.log("Waiting for transaction to be mined...");

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log(
      `Transaction confirmed! Gas used: ${receipt?.gasUsed.toString()}`
    );

    // In a real implementation, you would extract the vault address from the event logs
    // For this example, we're using a simplified approach
    const vaultAddress = receipt?.logs[0]?.address;
    console.log(`\nSuperVault created at address: ${vaultAddress}`);

    console.log("\nSuperVault ERC20 creation completed successfully!");
  } catch (error) {
    console.error("Error creating SuperVault:", error);
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
