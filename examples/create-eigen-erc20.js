/**
 * Example: Create an EigenLayer ERC20 Vault
 *
 * This example demonstrates how to create an EigenLayer ERC20 vault using the Byzantine Factory SDK.
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

    // Define EigenLayer ERC20 vault parameters
    const baseParams = {
      name: "EigenLayer stETH Vault",
      description: "An EigenLayer vault for stETH restaking",

      token_address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // stETH address

      is_deposit_limit: true,
      deposit_limit: ethers.parseUnits("1000", 18).toString(), // 1000 stETH

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

    const eigenLayerParams = {
      operator_id: "0xb564e795f9877b416cd1af86c98cf8d3d94d760d", // Replace with actual operator ID

      role_validator_manager: wallet.address,
    };

    console.log("\nCreating EigenLayer ERC20 vault with parameters:");
    console.log("Token:", baseParams.token_address);
    console.log(
      "Deposit limit:",
      ethers.formatUnits(BigInt(baseParams.deposit_limit), 18),
      "stETH"
    );
    console.log("Curator fee:", baseParams.curator_fee / 100, "%");

    // Create the vault
    console.log("\nSending transaction...");
    const tx = await client.createEigenLayerERC20Vault({
      base: baseParams,
      eigenlayer: eigenLayerParams,
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

    console.log("\nEigenLayer ERC20 vault creation completed successfully!");
  } catch (error) {
    console.error("Error creating vault:", error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
