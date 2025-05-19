# Byzantine Vault SDK

A TypeScript/JavaScript SDK for creating and managing vaults with Byzantine Finance Factory contract.

## About Byzantine Finance

Byzantine Finance is the first native restaking aggregation and abstraction layer. The protocol allows users to deploy various types of vaults for generating staking and restaking revenues.

This SDK provides a simple interface to interact with the Byzantine Factory contract deployed on:

- _Ethereum Mainnet -> Soon_
- [Holesky Testnet](https://holesky.etherscan.io/address/0x8080e4C9a3dCdA4Ce832Ab1A0Bc971079f81338D)
- [Sepolia Testnet](https://sepolia.etherscan.io/address/0x4C4b2673a5dd0fe70eb7e9A85b45dFb7822e197e)
- _Hoodi Testnet -> Soon_

The factory contract allows users to:

- **Create Eigenlayer ERC20 vaults**
<!-- - **Create Eigenlayer Native vaults** -->
- **Create Symbiotic ERC20 vaults**
- **Create ERC20 SuperVaults** with advanced features
<!-- - **Manage vault parameters** like deposit limits, curator fees, and access controls -->

## Installation

```bash
npm install @byzantine/vault-sdk
```

## Basic Setup

1. Create a `.env` file in your project root with the following variables:

```shell
RPC_URL=https://holesky.infura.io/v3/your_api_key_here

# Choose ONE of the following authentication methods:
MNEMONIC=your_wallet_mnemonic
# OR
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix

DEFAULT_CHAIN_ID=17000  # 17000 for Holesky testnet, 1 for Ethereum Mainnet, 11155111 for Sepolia, 560048 for Hoodi Testnet
```

2. Import and initialize the client:

```typescript
import {
  ByzantineClient,
  ETH_TOKEN_ADDRESS,
  BaseParams,
} from "@byzantine/vault-sdk";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC).connect(provider);
// OR const wallet = new ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);

const client = new ByzantineClient({
  chainId: 17000, // 17000 for Holesky, 11155111 for Sepolia, 1 for Mainnet, 560048 for Hoodi
  provider: provider,
  signer: wallet,
});
```

## Quick Start

### Creating an Eigenlayer ERC20 Vault

```typescript
import { ByzantineClient, getNetworkConfig } from "@byzantine/vault-sdk";
import { ethers } from "ethers";

// Initialize with ethers provider and signer
const provider = new ethers.JsonRpcProvider(
  "https://holesky.infura.io/v3/YOUR_API_KEY"
);
const wallet = ethers.Wallet.fromPhrase("your mnemonic").connect(provider);
// OR const wallet = new ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);

const client = new ByzantineClient({
  chainId: 17000, // Holesky testnet
  provider: provider,
  signer: wallet,
});

// Get the network configuration for token addresses
const networkConfig = getNetworkConfig(17000);

// Define vault parameters
const baseParams: BaseParams = {
  metadata: {
    name: "Eigenlayer stETH Vault",
    description: "An Eigenlayer vault for stETH restaking",
    image_url: "https://example.com/updated-vault-image.png",
    social_twitter: "https://x.com/byzantine_fi",
    social_discord: "https://discord.gg/byzantine",
    social_telegram: "https://t.me/byzantine",
    social_website: "https://byzantine.fi",
    social_github: "https://github.com/byzantine-finance",
  },
  token_address: networkConfig.stETHAddress,
  is_deposit_limit: true,
  deposit_limit: ethers.parseUnits("1000", 18),
  is_private: false,
  is_tokenized: true,
  token_name: "Byzantine stETH Vault",
  token_symbol: "bstETH",
  curator_fee: 500, // 5% (500 basis points)
  role_manager: wallet.address,
  role_version_manager: wallet.address,
  role_deposit_limit_manager: wallet.address,
  role_deposit_whitelist_manager: wallet.address,
  role_curator_fee_claimer: wallet.address,
  role_curator_fee_claimer_admin: wallet.address,
};

const eigenlayerParams: EigenlayerParams = {
  operator_id: "0xb564e795f9877b416cd1af86c98cf8d3d94d760d", // Replace with actual operator ID
  role_validator_manager: wallet.address,
};

// Create the vault
const tx = await client.createEigenlayerERC20Vault({
  base: baseParams,
  eigenlayer: eigenlayerParams,
});

// Wait for confirmation
const receipt = await tx.wait();
console.log(`Vault created in block ${receipt.blockNumber}`);

// Determine the vault address from the logs
const vaultAddress = receipt.logs[0].address;
console.log(`Vault created at address: ${vaultAddress}`);
```

### Creating an Eigenlayer Native (ETH) Vault

```ts
// -
// All import and initialize client as shown above
// -

// Define vault parameters
const nativeParams: NativeParams = {
  byzVaultParams: {
    metadata: {
      name: "Eigenlayer ETH Vault",
      description: "An Eigenlayer vault for ETH restaking",
    },
    token_address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    is_deposit_limit: true,
    deposit_limit: ethers.parseEther("100"),
    is_private: false,
    is_tokenized: true,
    token_name: "Byzantine ETH Vault",
    token_symbol: "bETH",
    curator_fee: 300, // 3% (300 basis points)
    role_manager: wallet.address,
    role_version_manager: wallet.address,
    role_deposit_limit_manager: wallet.address,
    role_deposit_whitelist_manager: wallet.address,
    role_curator_fee_claimer: wallet.address,
    role_curator_fee_claimer_admin: wallet.address,
  },
  operator_id:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  roles_validator_manager: [wallet.address],
};

const eigenlayerParams: EigenlayerParams = {
  delegation_set_role_holder: wallet.address,
  operator: "0xb564e795f9877b416cd1af86c98cf8d3d94d760d",
  approver_signature_and_expiry: {
    signature: "0x",
    expiry: 0,
  },
  approver_salt:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
};

const eigenPodParams: EigenpodParams = {
  eigen_pod_manager: address,
};

// Create the vault
const tx = await client.createEigenlayerNativeVault({
  base: nativeParams,
  eigenlayer: eigenlayerParams,
  eigenpod: eigenPodParams,
});

// Wait for confirmation
const receipt = await tx.wait();
```

### Creating a Symbiotic ERC20 Vault

```ts
// -
// All import and initialize client as shown above
// -

// Define vault parameters
const baseParams: BaseParams = {
  // Either metadata (that will be converted to URI) or directly URI
  metadata:
    "data:application/json;base64,eyJuYW1lIjoiU3ltYmlvdGljIG1FVEggVmF1bHQiLCJkZXNjcmlwdGlvbiI6IkEgU3ltYmlvdGljIHZhdWx0IGZvciBtRVRIIHJlc3Rha2luZyIsImltYWdlX3VybCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vdXBkYXRlZC12YXVsdC1pbWFnZS5wbmciLCJzb2NpYWxfdHdpdHRlciI6Imh0dHBzOi8veC5jb20vYnl6YW50aW5lX2ZpIiwic29jaWFsX2Rpc2NvcmQiOiJodHRwczovL2Rpc2NvcmQuZ2cvYnl6YW50aW5lIiwic29jaWFsX3RlbGVncmFtIjoiaHR0cHM6Ly90Lm1lL2J5emFudGluZSIsInNvY2lhbF93ZWJzaXRlIjoiaHR0cHM6Ly9ieXphbnRpbmUuZmkiLCJzb2NpYWxfZ2l0aHViIjoiaHR0cHM6Ly9naXRodWIuY29tL2J5emFudGluZS1maSJ9",
  token_address: "0x8d09a4502Cc8Cf1547aD300E066060D043f6982D", // wstETH
  is_deposit_limit: true,
  deposit_limit: ethers.parseUnits("500", 18), // 500 wstETH
  is_private: false,
  is_tokenized: true,
  token_name: "Byzantine wstETH Symbiotic Vault",
  token_symbol: "bwstETHs",
  curator_fee: 200, // 2% (200 basis points)
  role_manager: wallet.address,
  role_version_manager: wallet.address,
  role_deposit_limit_manager: wallet.address,
  role_deposit_whitelist_manager: wallet.address,
  role_curator_fee_claimer: wallet.address,
  role_curator_fee_claimer_admin: wallet.address,
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

// Create the vault
const tx = await client.createSymbioticERC20Vault({
  base: baseParams,
  symbiotic: symbioticParams,
});

// Wait for confirmation
const receipt = await tx.wait();
```

### Creating a ERC20 SuperVault

```ts
// -
// All import and initialize client as shown above
// -

// Define vault parameters
const baseParams = {
  metadata: {
    name: "SuperVault osETH",
    description: "A SuperVault for osETH with high yields",
  },

  token_address: networkConfig.osETHAddress, // osETH addresss

  is_deposit_limit: true,
  deposit_limit: ethers.parseUnits("1000000", 18), // 1M osETH (18 decimals)

  is_private: false, // Private SuperVault

  is_tokenized: true,
  token_name: "Byzantine osETH SuperVault",
  token_symbol: "bsosETHs",

  curator_fee: 600, // 6% (600 basis points)

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

const eigenlayerParams = {
  // Eigenlayer specific params
  delegation_set_role_holder: address,
  operator: "0xb564e795f9877b416cd1af86c98cf8d3d94d760d", // Blockshard

  approver_signature_and_expiry: {
    signature: "0x", // null signature
    expiry: 0, // no expiry
  },
  approver_salt:
    "0x0000000000000000000000000000000000000000000000000000000000000000", // null salt
};

const ratio = 500; // 5%
const curator = address;

// Create the vault
const tx = await client.createSuperVaultERC20({
  base: baseParams,
  symbiotic: symbioticParams,
  eigenlayer: eigenlayerParams,
  ratio: ratio,
  curator: curator,
});

// Wait for confirmation
const receipt = await tx.wait();
```

## Available Functions

### Create Vaults

```js
// Create Eigenlayer ERC20
await client.createEigenlayerERC20Vault(params);

// Create Eigenlayer Native
await client.createEigenlayerNativeVault(params);

// Create Symbiotic ERC20
await client.createSymbioticERC20Vault(params);

// Create SuperVault ERC20
await client.createSuperVaultERC20(params);
```

### Curate

```js
// Whitelist Management
await client.isAddressWhitelisted(vaultAddress, address);
await client.isVaultPrivate(vaultAddress);
await client.setAddressesWhitelistStatus(vaultAddress, addresses, canDeposit);
await client.setVaultPrivateStatus(vaultAddress, isPrivate);

// Deposit Limit Management
await client.getVaultDepositLimit(vaultAddress);
await client.isDepositLimitEnabled(vaultAddress);
await client.setVaultDepositLimit(vaultAddress, limit);
await client.setDepositLimitStatus(vaultAddress, enabled);

// Metadata Management
await client.getVaultMetadata(vaultAddress);
await client.updateVaultMetadata(vaultAddress, metadata);

// Fee Management
await client.getVaultFeePercentage(vaultAddress);
await client.getUnclaimedFees(vaultAddress);
await client.setVaultFeePercentage(vaultAddress, feePercentage);
await client.claimVaultFees(vaultAddress);

// SuperVault Management
await client.getDistributionRatio(supervaultAddress);
await client.getUnderlyingVaults(supervaultAddress);
await client.updateDistributionRatio(supervaultAddress, ratio);
await client.forceRebalance(supervaultAddress);

// Shares Management
await client.isSharesTokenized(vaultAddress);
await client.getSharesName(vaultAddress);
await client.getSharesSymbol(vaultAddress);
await client.getTotalShares(vaultAddress);
await client.getSharesBalance(vaultAddress, userAddress);
await client.convertToShares(vaultAddress, assets);
await client.convertToAssets(vaultAddress, shares);

// Role Management
await client.isRoleManager(vaultAddress, userAddress);
await client.isVersionManager(vaultAddress, userAddress);
await client.isWhitelistManager(vaultAddress, userAddress);
await client.isLimitManager(vaultAddress, userAddress);
await client.isDelegationManager(vaultAddress, userAddress);
await client.isOperatorNetworkSharesManager(vaultAddress, userAddress);
await client.isOperatorNetworkLimitManager(vaultAddress, userAddress);
await client.isNetworkLimitManager(vaultAddress, userAddress);
await client.isCurator(vaultAddress, userAddress);
await client.isCuratorFeeClaimer(vaultAddress, userAddress);
await client.isCuratorFeeClaimerAdmin(vaultAddress, userAddress);
await client.isOwnerBurner(vaultAddress, userAddress);
await client.isValidatorsManager(vaultAddress, userAddress);

await client.setRoleManager(vaultAddress, userAddress, enable);
await client.setVersionManager(vaultAddress, userAddress, enable);
await client.setWhitelistManager(vaultAddress, userAddress, enable);
await client.setLimitManager(vaultAddress, userAddress, enable);
await client.setDelegationManager(vaultAddress, userAddress, enable);
await client.setOperatorNetworkSharesManager(vaultAddress, userAddress, enable);
await client.setOperatorNetworkLimitManager(vaultAddress, userAddress, enable);
await client.setNetworkLimitManager(vaultAddress, userAddress, enable);
await client.setCurator(vaultAddress, userAddress, enable);
await client.setCuratorFeeClaimer(vaultAddress, userAddress, enable);
await client.setCuratorFeeClaimerAdmin(vaultAddress, userAddress, enable);
await client.setOwnerBurner(vaultAddress, userAddress, enable);
await client.setValidatorsManager(vaultAddress, userAddress, enable);
```

### Staker

```js
// Vault Information
await client.getVaultAsset(vaultAddress);
await client.getUserWalletBalance(assetAddress, userAddress);
await client.getUserVaultBalance(vaultAddress, userAddress);
await client.getVaultTVL(vaultAddress);
await client.getUserAllowance(assetAddress, userAddress, vaultAddress);
await client.getVaultType(vaultAddress); // Return RestakingProtocol ( "EigenLayer" | "Symbiotic" | "SuperVault" )
await client.isSymbioticVault(vaultAddress);
await client.isEigenVault(vaultAddress);
await client.isSupervault(vaultAddress);

// Deposit
await client.approveVault(assetAddress, vaultAddress, amount);
await client.depositToVault(vaultAddress, amount, autoApprove);

// Withdraw
await client.withdrawFromVault(vaultAddress, amount);
await client.redeemSharesFromVault(vaultAddress, shares);
await client.isClaimable(vaultAddress, requestId);
await client.completeWithdrawal(vaultAddress, requestId);
await client.getWithdrawalRequest(vaultAddress, requestId);

// Eigenlayer
await client.getEigenOperator(vaultAddress);
await client.setEigenOperator(
  vaultAddress,
  operator,
  approverSignatureAndExpiry,
  approverSalt
);

// Symbiotic
await client.getEpochAt(vaultAddress, timestamp);
await client.getEpochDuration(vaultAddress);
await client.getCurrentEpoch(vaultAddress);
await client.getCurrentEpochStart(vaultAddress);
await client.getPreviousEpochStart(vaultAddress);
await client.getNextEpochStart(vaultAddress);
await client.getSymVaultAddress(vaultAddress);
await client.getBurnerAddress(vaultAddress);
await client.getDelegatorAddress(vaultAddress);
await client.getDelegatorType(vaultAddress);
```

## Vault Types

### Eigenlayer Vaults

Eigenlayer vaults allow users to deposit ETH or ERC20 tokens for restaking on Eigenlayer's protocol. The two types available are:

- **Eigenlayer Native (ETH)** - For restaking ETH natively
- **Eigenlayer ERC20** - For restaking supported ERC20 tokens (e.g., stETH, rETH)

### Symbiotic Vaults

Symbiotic vaults provide enhanced features for ERC20 tokens, allowing customizable delegation strategies and slashing parameters.

### SuperVaults

SuperVaults are advanced vaults with additional features for managing ERC20 tokens with greater customization and control.

## Testing

The SDK includes comprehensive tests for all vault types and operations:

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Run all tests (requires environment variables in .env file)
npm run test

# Run specific vault creation tests
npm run test:eigen-erc20      # Test Eigenlayer ERC20 vault creation
npm run test:eigen-native     # Test Eigenlayer Native vault creation
npm run test:symbiotic-erc20  # Test Symbiotic ERC20 vault creation
npm run test:supervault-erc20 # Test SuperVault ERC20 creation

# Run vault operation tests
npm run test:vault-read-data        # Test reading vault data
npm run test:vault-operation        # Test vault operations (deposit/withdraw)
npm run test:vault-metadata         # Test vault metadata operations
npm run test:vault-claim-withdrawals # Test withdrawal claim process
npm run test:vault-roles           # Test role management operations
```

## Supported Networks

- _Ethereum Mainnet (Chain ID: 1) -> Soon_
- **Holesky Testnet (Chain ID: 17000)**
- **Sepolia Testnet (Chain ID: 11155111)**
- _Hoodi Testnet (Chain ID: 560048) -> Soon_

By default, the SDK is configured to use Holesky testnet (Chain ID: 17000). To use Ethereum Mainnet, specify `chainId: 1` when initializing the client. `chainId: 11155111` for Sepolia Testnet. `chainId: 560048` for Hoodi Testnet.

## NPM Package

This SDK is available on npm as [@byzantine/vault-sdk](https://www.npmjs.com/package/@byzantine/vault-sdk).

## Security

All Byzantine Finance contracts have been thoroughly audited.

## License

MIT
