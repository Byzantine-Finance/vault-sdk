# Byzantine Factory SDK

A TypeScript/JavaScript SDK for creating and managing vaults with Byzantine Finance Factory contract.

## About Byzantine Finance

Byzantine Finance is the first native restaking aggregation and abstraction layer. The platform allows users to deploy various types of vaults for generating staking and restaking revenues.

This SDK provides a simple interface to interact with the Byzantine Factory contract deployed on:

- Ethereum Mainnet
- [Holesky Testnet](https://holesky.etherscan.io/address/0x2439365bFd681354cc8BCc001a1893CF64e42768)

The factory contract allows users to:

- **Create Eigenlayer ERC20 vaults**
- **Create Eigenlayer Native vaults**
- **Create Symbiotic ERC20 vaults**
- **Create ERC20 SuperVaults** with advanced features
<!-- - **Manage vault parameters** like deposit limits, curator fees, and access controls -->

## Installation

```bash
npm install byzantine-factory-sdk
```

## Basic Setup

1. Create a `.env` file in your project root with the following variables:

```shell
RPC_URL=https://holesky.infura.io/v3/your_api_key_here
MNEMONIC=your_wallet_mnemonic
DEFAULT_CHAIN_ID=17000  # 17000 for Holesky testnet, 1 for Ethereum Mainnet
```

2. Import and initialize the client:

```typescript
import {
  ByzantineClient,
  ETH_TOKEN_ADDRESS,
  BaseParams,
} from "byzantine-factory-sdk";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC).connect(provider);

const client = new ByzantineClient({
  chainId: 17000, // 17000 for Holesky, 1 for Mainnet
  provider: provider,
  signer: wallet,
});
```

## Quick Start

### Creating an Eigenlayer ERC20 Vault

```typescript
import { ByzantineClient, getNetworkConfig } from "byzantine-factory-sdk";
import { ethers } from "ethers";

// Initialize with ethers provider and signer
const provider = new ethers.JsonRpcProvider(
  "https://holesky.infura.io/v3/YOUR_API_KEY"
);
const wallet = ethers.Wallet.fromPhrase("your mnemonic").connect(provider);

const client = new ByzantineClient({
  chainId: 17000, // Holesky testnet
  provider: provider,
  signer: wallet,
});

// Get the network configuration for token addresses
const networkConfig = getNetworkConfig(17000);

// Define vault parameters
const baseParams: BaseParams = {
  name: "Eigenlayer stETH Vault",
  description: "An Eigenlayer vault for stETH restaking",
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
    name: "Eigenlayer ETH Vault",
    description: "An Eigenlayer vault for ETH restaking",
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
  eigen_pod_owner: address,
  proof_submitter: address,
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
  name: "Symbiotic wstETH Vault",
  description: "A Symbiotic vault for wstETH restaking",
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
// Not available yet
```

## Testing

The SDK includes tests for each vault type:

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests (requires environment variables in .env file)
node test/create-eigen-erc20.js
node test/create-eigen-native.js
node test/create-symbiotic-erc20.js
node test/create-supervault-erc20.js
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

## API Reference

### Client Initialization

```typescript
const client = new ByzantineClient({
  chainId: number, // Chain ID (1 for Mainnet, 17000 for Holesky)
  provider: provider, // ethers.js provider
  signer: signer, // ethers.js signer (required for transactions)
});
```

### Core Functions

#### Vault Creation

- `createEigenlayerERC20Vault({ base, eigenlayer })`: Create an Eigenlayer ERC20 vault
- `createEigenlayerNativeVault({ base, eigenlayer })`: Create an Eigenlayer Native (ETH) vault
- `createSymbioticERC20Vault({ base, symbiotic })`: Create a Symbiotic ERC20 vault
- `createSuperVaultERC20({ base, symbiotic })`: Create a SuperVault for ERC20 tokens

### Constants

- `ETH_TOKEN_ADDRESS`: The canonical address for ETH (0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)

### Utility Functions

- `getNetworkConfig(chainId)`: Returns the network configuration for the given chain ID

## Supported Networks

- Ethereum Mainnet (Chain ID: 1)
- Holesky Testnet (Chain ID: 17000)

By default, the SDK is configured to use Holesky testnet (Chain ID: 17000). To use Ethereum Mainnet, specify `chainId: 1` when initializing the client.

## Security

All Byzantine Finance contracts have been thoroughly audited.

## License

MIT
