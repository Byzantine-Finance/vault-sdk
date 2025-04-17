/**
 * Example: Create an Eigenlayer ERC20 Vault
 *
 * This example demonstrates how to create an Eigenlayer ERC20 vault using the Byzantine Factory SDK.
 * It shows how to:
 * 1. Initialize the client with ethers.js
 * 2. Set up proper vault parameters
 * 3. Execute the vault creation transaction
 */

import { ByzantineFactoryClient, getNetworkConfig } from "../dist";
import { ethers } from "ethers";
import "dotenv/config";

async function main() {
  // Check environment variables
  const { RPC_URL, MNEMONIC, DEFAULT_CHAIN_ID } = process.env;

  if (!RPC_URL || !MNEMONIC) {
    console.error("Error: RPC_URL and MNEMONIC must be set in .env file");
    process.exit(1);
  }

  const parsedId = DEFAULT_CHAIN_ID ? parseInt(DEFAULT_CHAIN_ID) : 17000;
  const chainId = parsedId === 1 ? 1 : 17000;

  // console.log(
  //   `Using network: ${chainId === 1 ? "Ethereum Mainnet" : "Holesky Testnet"}`
  // );

  // Initialize provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);

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

    // Define Eigenlayer ERC20 vault parameters
    const baseParams = {
      name: "Eigenlayer stETH Vault",
      description: "An Eigenlayer vault for stETH restaking",

      token_address: networkConfig.stETHAddress, // Using token from network config

      is_deposit_limit: true,
      deposit_limit: ethers.parseUnits("1000", 18), // 1000 stETH

      is_private: false,

      is_tokenized: true,
      token_name: "Byzantine stETH Vault",
      token_symbol: "bstETH",

      curator_fee: 500, // 5% (500 basis points)

      // Roles - replace with actual addresses in production
      role_manager: wallet.address,
      role_version_manager: wallet.address,
      role_deposit_limit_manager: wallet.address,
      role_deposit_whitelist_manager: wallet.address,
      role_curator_fee_claimer: wallet.address,
      role_curator_fee_claimer_admin: wallet.address,
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

    console.log("\nCreating Eigenlayer ERC20 vault with parameters:");
    console.log("Base params:", baseParams);
    console.log("Eigenlayer params:", eigenlayerParams);

    // Create the vault
    console.log("\nSending transaction...");
    const tx = await client.createEigenlayerERC20Vault({
      base: baseParams,
      eigenlayer: eigenlayerParams,
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

    console.log("\nEigenlayer ERC20 vault creation completed successfully!");
  } catch (error) {
    console.error("Error creating vault:", error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
