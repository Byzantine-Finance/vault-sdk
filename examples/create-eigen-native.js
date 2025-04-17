/**
 * Example: Create an Eigenlayer Native Vault
 *
 * This example demonstrates how to create an Eigenlayer Native (ETH) vault using the Byzantine Factory SDK.
 * It shows how to:
 * 1. Initialize the client with ethers.js
 * 2. Set up proper vault parameters
 * 3. Execute the vault creation transaction
 */

const { ByzantineFactoryClient, ETH_TOKEN_ADDRESS } = require("../dist");
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

    // Define Eigenlayer Native vault parameters
    const baseParams = {
      // Base vault parameters wrapped in byzVaultParams
      byzVaultParams: {
        name: "Eigenlayer ETH Vault",
        description: "An Eigenlayer vault for ETH restaking",

        token_address: ETH_TOKEN_ADDRESS,

        is_deposit_limit: true,
        deposit_limit: ethers.parseEther("100").toString(), // Keep as string to avoid overflow

        is_private: false,

        is_tokenized: true,
        token_name: "Byzantine ETH Vault",
        token_symbol: "bETH",

        curator_fee: 300, // 3% (300 basis points)

        // Roles - replace with actual addresses in production
        role_manager: wallet.address,
        role_version_manager: wallet.address,
        role_deposit_limit_manager: wallet.address,
        role_deposit_whitelist_manager: wallet.address,
        role_curator_fee_claimer: wallet.address,
        role_curator_fee_claimer_admin: wallet.address,
      },

      // Native params specific to Eigenlayer vaults
      operator_id: "0xb564e795f9877b416cd1af86c98cf8d3d94d760d", // Replace with actual operator ID

      // Roles - replace with actual addresses in production
      roles_validator_manager: [
        wallet.address,
        "0x2222222222222222222222222222222222222222", // Additional validator manager
      ],
    };

    const eigenlayerParams = {
      // Eigenlayer specific params
      delegation_set_role_holder: wallet.address,
      operator: "0xb564e795f9877b416cd1af86c98cf8d3d94d760d", // Same as operator_id

      approver_signature_and_expiry: {
        signature: "0x", // null signature
        expiry: 0, // no expiry
      },
      approver_salt:
        "0x0000000000000000000000000000000000000000000000000000000000000000", // null salt
    };

    // EigenPod parameters - required for native vaults
    const eigenPodParams = {
      eigen_pod_owner: wallet.address,
      proof_submitter: wallet.address,
    };

    console.log("\nCreating Eigenlayer Native vault with parameters:");
    console.log("Token: ETH (Native)");
    console.log(
      "Deposit limit:",
      ethers.formatEther(BigInt(baseParams.byzVaultParams.deposit_limit)),
      "ETH"
    );
    console.log(
      "Curator fee:",
      baseParams.byzVaultParams.curator_fee / 100,
      "%"
    );

    // Create the vault with the new structure that includes eigenPod params
    console.log("\nSending transaction...");
    const tx = await client.createEigenlayerNativeVault({
      base: baseParams,
      eigenlayer: eigenlayerParams,
      eigenpod: eigenPodParams,
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

    console.log("\nEigenlayer Native vault creation completed successfully!");
  } catch (error) {
    console.error("Error creating vault:", error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
