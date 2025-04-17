/**
 * Example: Create a Symbiotic ERC20 Vault
 *
 * This example demonstrates how to create a Symbiotic ERC20 vault using the Byzantine Factory SDK.
 * It shows how to:
 * 1. Initialize the client with ethers.js
 * 2. Set up proper vault parameters including the symbiotic-specific parameters
 * 3. Execute the vault creation transaction
 */

import {
  ByzantineFactoryClient,
  getNetworkConfig,
  BaseParams,
  SymbioticParams,
  DelegatorType,
  SlasherType,
} from "../dist";
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

  const parsedId = DEFAULT_CHAIN_ID ? parseInt(DEFAULT_CHAIN_ID) : 17000;
  const chainId = parsedId === 1 ? 1 : 17000;

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
  const address = await wallet.getAddress();
  console.log(`Using wallet address: ${wallet.address}`);

  const networkConfig = getNetworkConfig(chainId); // Only for our example, to get the token address

  try {
    // Initialize Byzantine Factory client
    const client = new ByzantineFactoryClient({
      chainId: chainId,
      provider: provider,
      signer: wallet,
    });

    console.log(`Connected to Byzantine Factory at: ${client.contractAddress}`);

    // Define Symbiotic ERC20 vault parameters
    const baseParams: BaseParams = {
      name: "Symbiotic wstETH Vault",
      description: "A Symbiotic vault for wstETH restaking",

      token_address: networkConfig.wstETHAddress, // wstETH address from network config

      is_deposit_limit: true,
      deposit_limit: ethers.parseUnits("500", 18), // 500 wstETH

      is_private: false,

      is_tokenized: true,
      token_name: "Byzantine wstETH Symbiotic Vault",
      token_symbol: "bwstETHs",

      curator_fee: 200, // 2% (200 basis points)

      // Roles - replace with actual addresses in production
      role_manager: address,
      role_version_manager: address,
      role_deposit_limit_manager: address,
      role_deposit_whitelist_manager: address,
      role_curator_fee_claimer: address,
      role_curator_fee_claimer_admin: address,
    };

    const symbioticParams: SymbioticParams = {
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

    console.log("\nCreating Symbiotic ERC20 vault with parameters:");
    console.log("Base params:", baseParams);
    console.log("Symbiotic params:", symbioticParams);

    console.log("\nSending transaction...");
    const tx = await client.createSymbioticERC20Vault({
      base: baseParams,
      symbiotic: symbioticParams,
    });

    console.log(`Transaction sent! Hash: ${tx.hash}`);
    console.log("Waiting for transaction to be mined...");

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    if (receipt) {
      console.log(
        `Transaction confirmed! Gas used: ${receipt.gasUsed.toString()}`
      );

      // In a real implementation, you would extract the vault address from the event logs
      // For this example, we're using a simplified approach
      const vaultAddress = receipt.logs[0].address;
      console.log(`\nVault created at address: ${vaultAddress}`);
      console.log(
        `Explorer link: ${networkConfig.scanLink}/address/${vaultAddress}`
      );
    }

    console.log("\nSymbiotic ERC20 vault creation completed successfully!");
  } catch (error) {
    console.error("Error creating vault:", error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
