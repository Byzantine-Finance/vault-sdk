/**
 * Example: Create an Eigenlayer Native Vault
 *
 * This example demonstrates how to create an Eigenlayer Native (ETH) vault using the Byzantine Factory SDK.
 * It shows how to:
 * 1. Initialize the client with ethers.js
 * 2. Set up proper vault parameters
 * 3. Execute the vault creation transaction
 */

import {
  ByzantineClient,
  ETH_TOKEN_ADDRESS,
  NativeParams,
  EigenlayerParams,
  EigenpodParams,
  getNetworkConfig,
} from "../dist";
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
  const address = await wallet.getAddress();
  console.log(`Using wallet address: ${wallet.address}`);

  const networkConfig = getNetworkConfig(chainId); // Only for our example, to get the token address

  try {
    // Initialize Byzantine Factory client
    const client = new ByzantineClient({
      chainId: chainId,
      provider: provider,
      signer: wallet,
    });

    console.log(`Connected to Byzantine Factory at: ${client.contractAddress}`);

    // Define Eigenlayer Native vault parameters
    const baseParams: NativeParams = {
      // Base vault parameters wrapped in byzVaultParams
      byzVaultParams: {
        name: "Eigenlayer ETH Vault",
        description: "An Eigenlayer vault for ETH restaking",

        token_address: ETH_TOKEN_ADDRESS, // For native vaults, this HAS to be "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

        is_deposit_limit: true,
        deposit_limit: ethers.parseEther("100"),

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
      },

      // Native params specific to Eigenlayer vaults

      // This is to specify which operaotr you want for the native staking:
      // - hash("distributed.validator.vault") for DV Vaults -> 0x28bd0ddc8f4b17c1dc8626b6844cf59ae1383b3e6cedd64f6e7b64fab6d36480
      // - hash("company.name") for Partner Validated Vaults
      // - bytes32(0) for Solo Staker Vaults -> 0x0000000000000000000000000000000000000000000000000000000000000000
      operator_id:
        "0x0000000000000000000000000000000000000000000000000000000000000000",

      // Roles - replace with actual addresses in production
      // Only specify this when operator_id is bytes32(0), otherwise let it empty
      roles_validator_manager: [address],
    };

    const eigenlayerParams: EigenlayerParams = {
      // Eigenlayer specific params
      delegation_set_role_holder: wallet.address,
      operator: "0xb564e795f9877b416cd1af86c98cf8d3d94d760d", // EigenLayer operator address

      approver_signature_and_expiry: {
        signature: "0x", // null signature
        expiry: 0, // no expiry
      },
      approver_salt:
        "0x0000000000000000000000000000000000000000000000000000000000000000", // null salt
    };

    // EigenPod parameters - required for native vaults
    const eigenPodParams: EigenpodParams = {
      eigen_pod_owner: address,
      proof_submitter: address,
    };

    console.log("\nCreating Eigenlayer Native vault with parameters:");
    console.log("Base params:", baseParams);
    console.log("Eigenlayer params:", eigenlayerParams);
    console.log("EigenPod params:", eigenPodParams);

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
