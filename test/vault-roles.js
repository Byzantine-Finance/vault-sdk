// @ts-check

/**
 * Byzantine Vault SDK - Role Management Test
 * Tests the role management functionality of vaults
 */

const { ethers } = require("ethers");
const { ByzantineClient, DelegatorType } = require("../dist");
const {
  getNetworkConfig,
  ETH_TOKEN_ADDRESS,
} = require("../dist/constants/networks");
const { logTitle, logResult, assert } = require("./utils");
require("dotenv").config();

// Import environment variables
const { RPC_URL, MNEMONIC, PRIVATE_KEY, DEFAULT_CHAIN_ID } = process.env;

// Configuration flag to enable/disable role modifications
const ACTIVE_SET_ROLES = false;

// Store initial role states
let initialRoleStates = {};

async function checkRole(
  client,
  VAULT_ADDRESS,
  roleCheckMethod,
  userAddress,
  roleName
) {
  const hasRole = await roleCheckMethod(VAULT_ADDRESS, userAddress);
  logResult(
    `Check ${roleName} role`,
    true,
    `${hasRole ? "Has role" : "No role"}`
  );
  return hasRole;
}

async function setAndVerifyRole(
  client,
  VAULT_ADDRESS,
  roleSetMethod,
  roleCheckMethod,
  userAddress,
  enable,
  roleName
) {
  if (!ACTIVE_SET_ROLES) {
    logResult(
      `Skip setting ${roleName} role`,
      true,
      "ACTIVE_SET_ROLES is false"
    );
    return;
  }

  const tx = await roleSetMethod(VAULT_ADDRESS, userAddress, enable);
  await tx.wait();
  logResult(
    `${enable ? "Grant" : "Revoke"} ${roleName} role`,
    true,
    `TX: ${tx.hash}`
  );

  const hasRole = await roleCheckMethod(VAULT_ADDRESS, userAddress);
  assert(
    hasRole === enable,
    `Role ${roleName} should ${enable ? "be granted" : "be revoked"}`
  );
}

async function runTests() {
  console.log("\n🧪 Byzantine Vault SDK - Role Management Test 🧪\n");

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

  // Skip tests requiring network connection if no API key
  skipNetworkTests = !RPC_URL;

  if (skipNetworkTests) {
    console.log(
      "⚠️ Network tests skipped. Please provide RPC_URL to run tests."
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
  assert(client !== undefined, "Client initialization");

  // Test vault addresses - add your own or use these examples
  const VAULT_ADDRESS = "0x92bc5ec4e156e6dfcb40a8e04628fb211e2ad56e";

  console.log("Network:", networkConfig.name, `(Chain ID: ${chainId})`);
  console.log("User address:", userAddress);
  console.log("Vault address:", VAULT_ADDRESS);

  const vaultType = await client.getVaultType(VAULT_ADDRESS);
  console.log("");
  logResult("Vault type", true, vaultType);
  const collateralToken = await client.getVaultAsset(VAULT_ADDRESS);
  logResult("Collateral token", true, collateralToken);

  let delegatorType;
  if (vaultType === "Symbiotic" || vaultType === "SuperVault") {
    delegatorType = await client.getDelegatorType(VAULT_ADDRESS);
    logResult("Delegator type", true, delegatorType.toString());

    const symVaultAddress = await client.getSymVaultAddress(VAULT_ADDRESS);
    const delegatorAddress = await client.getDelegatorAddress(VAULT_ADDRESS);
    const burnerAddress = await client.getBurnerAddress(VAULT_ADDRESS);
    logResult("Sym vault address", true, symVaultAddress);
    logResult("Delegator address", true, delegatorAddress);
    logResult("Burner address", true, burnerAddress);
  }
  logTitle("Role Checks");

  // Define role check pairs (method to check role, method to set role, role name)
  const roleChecks = [
    // Base vault roles
    [
      client.isRoleManager.bind(client),
      client.setRoleManager.bind(client),
      "Role Manager",
    ],
    [
      client.isVersionManager.bind(client),
      client.setVersionManager.bind(client),
      "Version Manager",
    ],
    [
      client.isWhitelistManager.bind(client),
      client.setWhitelistManager.bind(client),
      "Whitelist Manager",
    ],
    [
      client.isLimitManager.bind(client),
      client.setLimitManager.bind(client),
      "Limit Manager",
    ],
    [
      client.isCuratorFeeClaimer.bind(client),
      client.setCuratorFeeClaimer.bind(client),
      "Curator Fee Claimer",
    ],
    [
      client.isCuratorFeeClaimerAdmin.bind(client),
      client.setCuratorFeeClaimerAdmin.bind(client),
      "Curator Fee Claimer Admin",
    ],

    // Native vault roles
    ...(collateralToken === ETH_TOKEN_ADDRESS
      ? [
          [
            client.isValidatorsManager.bind(client),
            client.setValidatorsManager.bind(client),
            "Validators Manager",
          ],
        ]
      : []),

    // SuperVault roles
    ...(vaultType === "SuperVault"
      ? [
          [
            client.isCurator.bind(client),
            client.setCurator.bind(client),
            "Curator",
          ],
        ]
      : []),

    // Eigenlayer roles
    ...(vaultType === "EigenLayer" || vaultType === "SuperVault"
      ? [
          [
            client.isDelegationManager.bind(client),
            client.setDelegationManager.bind(client),
            "Delegation Manager",
          ],
        ]
      : []),

    // Symbiotic roles
    ...(vaultType === "Symbiotic" || vaultType === "SuperVault"
      ? [
          ...(delegatorType == DelegatorType.NETWORK_RESTAKE
            ? [
                [
                  client.isOperatorNetworkSharesManager.bind(client),
                  client.setOperatorNetworkSharesManager.bind(client),
                  "Operator Network Shares Manager",
                ],
              ]
            : []),
          ...(delegatorType == DelegatorType.FULL_RESTAKE
            ? [
                [
                  client.isOperatorNetworkLimitManager.bind(client),
                  client.setOperatorNetworkLimitManager.bind(client),
                  "Operator Network Limit Manager",
                ],
              ]
            : []),
          [
            client.isNetworkLimitManager.bind(client),
            client.setNetworkLimitManager.bind(client),
            "Network Limit Manager",
          ],
          [
            client.isOwnerBurner.bind(client),
            client.setOwnerBurner.bind(client),
            "Owner Burner",
          ],
        ]
      : []),
  ];

  // Store initial role states
  console.log("\nStoring initial role states...");
  for (const [checkMethod, _, roleName] of roleChecks) {
    initialRoleStates[roleName] = await checkMethod(VAULT_ADDRESS, userAddress);
    logResult(
      roleName,
      true,
      initialRoleStates[roleName] ? "✅ Has role" : "❌ No role"
    );
  }

  if (ACTIVE_SET_ROLES) {
    logTitle("Role Modifications");

    // Test granting roles
    for (const [checkMethod, setMethod, roleName] of roleChecks) {
      await setAndVerifyRole(
        client,
        VAULT_ADDRESS,
        setMethod,
        checkMethod,
        userAddress,
        true,
        roleName
      );
    }

    // Test revoking roles
    for (const [checkMethod, setMethod, roleName] of roleChecks) {
      await setAndVerifyRole(
        client,
        VAULT_ADDRESS,
        setMethod,
        checkMethod,
        userAddress,
        false,
        roleName
      );
    }

    logTitle("Role Restoration");

    // Restore initial states
    console.log("\nRestoring initial role states...");
    for (const [checkMethod, setMethod, roleName] of roleChecks) {
      if (
        initialRoleStates[roleName] !==
        (await checkMethod(VAULT_ADDRESS, userAddress))
      ) {
        await setAndVerifyRole(
          client,
          VAULT_ADDRESS,
          setMethod,
          checkMethod,
          userAddress,
          initialRoleStates[roleName],
          roleName
        );
      }
    }
  }

  console.log("\nTest Complete");
}

// Run tests
runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
