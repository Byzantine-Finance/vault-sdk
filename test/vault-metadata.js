/**
 * Byzantine Vault Metadata Test
 *
 * This test demonstrates how to update metadata for a Byzantine vault
 * using the Byzantine SDK Client. It covers:
 * 1. Trying to update with invalid metadata (should fail validation)
 * 2. Updating with valid metadata (should succeed)
 */
const { ethers } = require("ethers");
const { ByzantineClient } = require("../dist");
const { getNetworkConfig } = require("../dist/constants/networks");
const { Metadata } = require("../dist/types");
const { logTitle, logResult, assert } = require("./utils");
require("dotenv").config();

// Import environment variables
const { RPC_URL, MNEMONIC, PRIVATE_KEY, DEFAULT_CHAIN_ID } = process.env;

// Test suite
async function runMetadataTests() {
  console.log("\n🧪 Byzantine SDK - Vault Metadata Update Test 🧪\n");

  // Check if environment variables are set
  const parsedId = DEFAULT_CHAIN_ID ? parseInt(DEFAULT_CHAIN_ID) : 17000;
  const chainId = parsedId === 1 ? 1 : 17000;

  let skipNetworkTests = false;
  if (!RPC_URL) {
    console.warn(
      "⚠️ Warning: RPC_URL not set in .env file. Tests will be skipped."
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

  // Skip tests requiring network connection if missing info
  if (skipNetworkTests) {
    console.log(
      "⚠️ Tests skipped. Please provide RPC_URL and MNEMONIC to run tests."
    );
    return;
  }

  // Initialize provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  let wallet;
  if (MNEMONIC) {
    wallet = ethers.Wallet.fromPhrase(MNEMONIC).connect(provider);
    console.log("Using wallet from mnemonic phrase");
  } else if (PRIVATE_KEY) {
    wallet = new ethers.Wallet(PRIVATE_KEY).connect(provider);
    console.log("Using wallet from private key");
  } else {
    throw new Error("No wallet credentials provided");
  }
  const userAddress = await wallet.getAddress();

  // Initialize client
  const client = new ByzantineClient({
    chainId: chainId,
    provider: provider,
    signer: wallet,
  });

  // Get network configuration for token addresses
  const networkConfig = getNetworkConfig(chainId);

  logResult("Client initialization", true);
  assert(client !== undefined, "Client should be initialized");

  // Hard-coded vault address for the test
  const VAULT_ADDRESS = "0x1f7cc65ebd5afb3e85b32e5a8a6484afa7811510";

  console.log("Network:", networkConfig.name, `(Chain ID: ${chainId})`);
  console.log("Vault address:", VAULT_ADDRESS);
  console.log("User address:", userAddress);

  try {
    // =============================================
    // 1. Update with Invalid Metadata (Missing Description)
    // =============================================
    logTitle("Invalid Metadata Update Test");

    // Create incomplete metadata (missing description)
    const invalidMetadata = {
      name: `Byzantine Test Vault (${new Date().toISOString()})`,
      // description is missing intentionally
      image_url: "https://example.com/updated-vault-image.png",
    };

    try {
      // Try to update vault metadata with invalid data
      const tx = await client.updateVaultMetadata(
        VAULT_ADDRESS,
        invalidMetadata
      );
      console.log("Transaction hash:", tx.hash);

      // Wait for transaction to be mined
      console.log("Waiting for transaction to be mined...");
      await tx.wait();

      // If we get here, the test didn't fail as expected
      logResult(
        "Invalid metadata update test",
        false,
        "Transaction should have failed but succeeded"
      );
    } catch (error) {
      // Check if the error is specifically about missing description
      const errorMessage = error.message || "Unknown error";

      if (
        errorMessage.includes("must include") &&
        errorMessage.includes("description")
      ) {
        logResult(
          "Invalid metadata update test",
          true,
          "Validation failed as expected (missing description)"
        );
      } else {
        logResult(
          "Invalid metadata update test",
          false,
          `Unexpected error: ${errorMessage}`
        );
      }
    }

    // =============================================
    // 2. Update with Valid Metadata
    // =============================================
    logTitle("Valid Metadata Update Test");

    // Create complete valid metadata
    const validMetadata = {
      name: "Symbiotic Vault",
      description: "A Symbiotic vault for wstETH restaking",
      image_url: "https://example.com/updated-vault-image.png",
      social_twitter: "https://x.com/byzantine_fi",
      social_discord: "https://discord.gg/byzantine",
      social_website: "https://byzantine.fi",
      social_github: "https://github.com/byzantine-finance",
    };

    try {
      // Update vault metadata with valid data
      const tx = await client.updateVaultMetadata(VAULT_ADDRESS, validMetadata);

      logResult("Sending transaction", true, "Transaction hash: " + tx.hash);

      // Wait for transaction to be mined
      await tx.wait();
      logResult("Transaction mined", true, "Transaction successful");
    } catch (error) {
      const errorMessage = error.message || "Unknown error";
      logResult("Valid metadata update test", false, errorMessage);
    }

    // =============================================
    // 0. Invalid Metadata Scenarios (should fail)
    // =============================================
    logTitle("Invalid Metadata Scenarios");

    const invalidScenarios = [
      {
        label: "Name too long",
        metadata: {
          name: "A".repeat(101), // 101 chars, max is 100
          description: "desc",
          image_url: "https://example.com/image.png",
        },
        expect: "Name exceeds maximum length",
      },
      {
        label: "Description too long",
        metadata: {
          name: "Valid Name",
          description: "D".repeat(5001), // 5001 chars, max is 5000
          image_url: "https://example.com/image.png",
        },
        expect: "Description exceeds maximum length",
      },
      {
        label: "Image with unsupported extension (.svg)",
        metadata: {
          name: "Valid Name",
          description: "desc",
          image_url: "https://example.com/image.svg",
        },
        expect: "Image URL must end with one of the following extensions",
      },
      {
        label: "Image with unsupported extension on raw.githubusercontent.com",
        metadata: {
          name: "Valid Name",
          description: "desc",
          image_url:
            "https://raw.githubusercontent.com/user/repo/main/image.svg",
        },
        expect: "Image URL must end with one of the following extensions",
      },
      {
        label: "Image with non-URL string",
        metadata: {
          name: "Valid Name",
          description: "desc",
          image_url: "not-a-url",
        },
        expect: "Image URL must be a valid HTTP/HTTPS URL",
      },
      {
        label: "Invalid Twitter URL",
        metadata: {
          name: "Valid Name",
          description: "desc",
          image_url: "https://example.com/image.png",
          social_twitter: "https://notwitter.com/user",
        },
        expect: "Twitter URL must be a valid Twitter URL format",
      },
      {
        label: "Invalid Website URL",
        metadata: {
          name: "Valid Name",
          description: "desc",
          image_url: "https://example.com/image.png",
          social_website: "notaurl",
        },
        expect: "Website URL must be a valid HTTP/HTTPS URL",
      },
      {
        label: "Invalid GitHub URL",
        metadata: {
          name: "Valid Name",
          description: "desc",
          image_url: "https://example.com/image.png",
          social_github: "https://notgithub.com/user",
        },
        expect: "GitHub URL must be a valid GitHub URL format",
      },
    ];

    for (const scenario of invalidScenarios) {
      try {
        await client.updateVaultMetadata(VAULT_ADDRESS, scenario.metadata);
        logResult(scenario.label, false, "Should have failed but succeeded");
      } catch (error) {
        const errorMessage = error.message || "Unknown error";
        if (errorMessage.includes(scenario.expect)) {
          logResult(
            scenario.label,
            true,
            `Validation failed as expected: ${errorMessage}`
          );
        } else {
          logResult(scenario.label, false, `Unexpected error: ${errorMessage}`);
        }
      }
    }
  } catch (error) {
    const errorMessage = error.message || "Unknown error";
    logResult("Test failed", false, errorMessage);
  }

  console.log("\n✅ Vault Metadata Update Test completed\n");
}

// Run tests
runMetadataTests().catch((error) => {
  const errorMessage = error.message || "Unknown error";
  console.error("Error running tests: " + errorMessage);
});
