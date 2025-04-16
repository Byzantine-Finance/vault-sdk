# Byzantine Factory SDK

A TypeScript/JavaScript SDK for creating and managing vaults with Byzantine Finance Factory contract.

## About Byzantine Finance

Byzantine Finance is the first native restaking aggregation and abstraction layer. The platform allows users to deploy various types of vaults for generating staking and restaking revenues.

This SDK provides a simple interface to interact with the Byzantine Factory contract deployed on:

- Ethereum Mainnet
- [Holesky Testnet](https://holesky.etherscan.io/address/0x53CC4133F7A60d48E91D8D27b910a474a3Be9f7d)

The factory contract allows users to:

- **Create EigenLayer ERC20 vaults**
- **Create EigenLayer Native vaults**
- **Create Symbiotic ERC20 vaults**
- **Create ERC20 SuperVaults** with advanced features
- **Manage vault parameters** like deposit limits, curator fees, and access controls

## Installation

```bash
npm install byzantine-factory-sdk
```

## Basic Setup

1. Create a `.env` file in your project root with the following variables:

```shell
INFURA_API_KEY=your_infura_api_key
MNEMONIC=your_wallet_mnemonic
DEFAULT_CHAIN_ID=17000  # 17000 for Holesky testnet, 1 for Ethereum Mainnet
```

2. Import and initialize the client:

```typescript
import {
  ByzantineFactoryClient,
  ETH_TOKEN_ADDRESS,
} from "byzantine-factory-sdk";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(
  `https://holesky.infura.io/v3/${process.env.INFURA_API_KEY}`
);
const wallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC).connect(provider);

const client = new ByzantineFactoryClient({
  chainId: 17000, // 17000 for Holesky, 1 for Mainnet
  provider: provider,
  signer: wallet,
});
```

## Quick Start

### Creating an EigenLayer ERC20 Vault

```typescript
import {
  ByzantineFactoryClient,
  getNetworkConfig,
} from "byzantine-factory-sdk";
import { ethers } from "ethers";

// Initialize with ethers provider and signer
const provider = new ethers.JsonRpcProvider(
  "https://holesky.infura.io/v3/YOUR_INFURA_KEY"
);
const wallet = ethers.Wallet.fromPhrase("your mnemonic").connect(provider);

const client = new ByzantineFactoryClient({
  chainId: 17000, // Holesky testnet
  provider: provider,
  signer: wallet,
});

// Get the network configuration for token addresses
const networkConfig = getNetworkConfig(17000);

// Define vault parameters
const baseParams = {
  name: "EigenLayer stETH Vault",
  description: "An EigenLayer vault for stETH restaking",
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

const eigenLayerParams = {
  operator_id: "0xb564e795f9877b416cd1af86c98cf8d3d94d760d", // Replace with actual operator ID
  role_validator_manager: wallet.address,
};

// Create the vault
const tx = await client.createEigenLayerERC20Vault({
  base: baseParams,
  eigenlayer: eigenLayerParams,
});

// Wait for confirmation
const receipt = await tx.wait();
console.log(`Vault created in block ${receipt.blockNumber}`);

// Determine the vault address from the logs
const vaultAddress = receipt.logs[0].address;
console.log(`Vault created at address: ${vaultAddress}`);
```

### Creating an EigenLayer Native (ETH) Vault

```typescript
import {
  ByzantineFactoryClient,
  ETH_TOKEN_ADDRESS,
} from "byzantine-factory-sdk";
import { ethers } from "ethers";

// Initialize client as shown above

// Define vault parameters
const baseParams = {
  operator_id: "0xb564e795f9877b416cd1af86c98cf8d3d94d760d",
  roles_validator_manager: [wallet.address],
};

const eigenLayerParams = {
  name: "EigenLayer ETH Vault",
  description: "An EigenLayer vault for ETH restaking",
  token_address: ETH_TOKEN_ADDRESS,
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
  operator_id: "0xb564e795f9877b416cd1af86c98cf8d3d94d760d",
  role_validator_manager: wallet.address,
};

// Create the vault
const tx = await client.createEigenLayerNativeVault({
  base: baseParams,
  eigenlayer: eigenLayerParams,
});

// Wait for confirmation
const receipt = await tx.wait();
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

### EigenLayer Vaults

EigenLayer vaults allow users to deposit ETH or ERC20 tokens for restaking on EigenLayer's protocol. The two types available are:

- **EigenLayer Native (ETH)** - For restaking ETH natively
- **EigenLayer ERC20** - For restaking supported ERC20 tokens (e.g., stETH, rETH)

### Symbiotic Vaults

Symbiotic vaults provide enhanced features for ERC20 tokens, allowing customizable delegation strategies and slashing parameters.

### SuperVaults

SuperVaults are advanced vaults with additional features for managing ERC20 tokens with greater customization and control.

## API Reference

### Client Initialization

```typescript
const client = new ByzantineFactoryClient({
  chainId: number, // Chain ID (1 for Mainnet, 17000 for Holesky)
  provider: provider, // ethers.js provider
  signer: signer, // ethers.js signer (required for transactions)
});
```

### Core Functions

#### Vault Creation

- `createEigenLayerERC20Vault({ base, eigenlayer })`: Create an EigenLayer ERC20 vault
- `createEigenLayerNativeVault({ base, eigenlayer })`: Create an EigenLayer Native (ETH) vault
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
