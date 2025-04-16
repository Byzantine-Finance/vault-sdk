# Byzantine Deposit SDK

A TypeScript/JavaScript SDK for interacting with the Byzantine Finance Deposit contract.

## About Byzantine Finance

Byzantine Finance is the first native restaking aggregation and abstraction layer. The platform allows users to deposit tokens and earn points, which will later enable moving tokens to vaults for generating staking and restaking revenues.

This SDK provides a simple interface to interact with the Byzantine Deposit contract deployed on:

- Ethereum Mainnet: [0xbA98A4d436e79639A1598aFc988eFB7A828d7F08](https://etherscan.io/address/0xbA98A4d436e79639A1598aFc988eFB7A828d7F08)
- Holesky Testnet: [0xF7517CB32Cd5e78a2E0AB6BcBD46b974aCe7f148](https://holesky.etherscan.io/address/0xF7517CB32Cd5e78a2E0AB6BcBD46b974aCe7f148)

The deposit contract allows users to:

- **Deposit** ETH, LSTs (Liquid Staking Tokens), or any other whitelisted token, generating points while tokens are deposited
- **Withdraw** tokens at any time, stopping point generation
- **Move to vault** (coming soon) will enable moving tokens to Byzantine vaults to generate staking and restaking revenues

Users can also interact with the contract directly through the [Byzantine Deposit Interface](https://deposit.byzantine.fi/).

## Installation

```bash
npm install byzantine-deposit-sdk
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
  ByzantineDepositClient,
  ETH_TOKEN_ADDRESS,
} from "byzantine-deposit-sdk";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(
  `https://holesky.infura.io/v3/${process.env.INFURA_API_KEY}`
);
const wallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC).connect(provider);

const client = new ByzantineDepositClient({
  chainId: 17000, // 17000 for Holesky, 1 for Mainnet
  provider: provider,
  signer: wallet,
});
```

## Quick Start

### Using ethers.js

```typescript
import {
  ByzantineDepositClient,
  ETH_TOKEN_ADDRESS,
} from "byzantine-deposit-sdk";
import { ethers } from "ethers";

// Initialize with ethers provider and signer
const provider = new ethers.JsonRpcProvider(
  "https://holesky.infura.io/v3/YOUR_INFURA_KEY"
);
const wallet = ethers.Wallet.fromPhrase("your mnemonic").connect(provider);

const client = new ByzantineDepositClient({
  chainId: 17000, // Holesky testnet
  provider: provider,
  signer: wallet,
});

// Deposit ETH
const tx = await client.depositETH(ethers.parseEther("0.1"));
const receipt = await tx.wait();
console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

// Check your deposit
const address = await wallet.getAddress();
const depositedAmount = await client.getDepositedAmount({
  address,
  token: ETH_TOKEN_ADDRESS,
});
console.log(`Deposited amount: ${ethers.formatEther(depositedAmount)} ETH`);
```

### Using wagmi (React)

```typescript
import {
  ByzantineDepositWagmiClient,
  useByzantineDepositClient,
  ETH_TOKEN_ADDRESS,
} from "byzantine-deposit-sdk";
import { createConfig } from "wagmi";
import { mainnet, holesky } from "wagmi/chains";

// Initialize with wagmi config
const config = createConfig({
  // your wagmi configuration
});

// In your React component:
export function MyComponent() {
  const { data: client } = useByzantineDepositClient({
    chainId: 17000, // Holesky testnet
  });

  const handleDeposit = async () => {
    if (!client) return;
    // Deposit ETH
    const tx = await client.depositETH(parseEther("0.1"));
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Deposit confirmed in block ${receipt.blockNumber}`);
  };

  return <button onClick={handleDeposit}>Deposit 0.1 ETH</button>;
}
```

## Testing

The SDK includes two types of tests:

```bash
# Run simple tests (no transactions, only reads)
npm test
```

```bash
# Run advanced tests (performs actual transactions on Holesky)
node test/advanced-test.js
```

The simple tests validate basic SDK functionality without executing transactions, while the advanced tests perform actual deposits and withdrawals on the Holesky testnet.

## Examples

Check out the complete examples in the `examples` directory:

- `examples/nodejs-js`: Example using Node.js with JavaScript

  ```bash
  npm run example:nodejs-js
  ```

- `examples/nodejs-ts`: Example using Node.js with TypeScript

  ```bash
  npm run example:nodejs-ts
  ```

- `examples/nextjs-ts`: Example using Next.js with TypeScript and wagmi
  ```bash
  npm run example:nextjs
  ```

## API Reference

### Client Initialization

#### `ByzantineDepositClient`

Initialize the client with ethers.js.

```typescript
const client = new ByzantineDepositClient({
  chainId: number, // Chain ID (1 for Mainnet, 17000 for Holesky)
  provider: provider, // ethers.js provider
  signer: signer, // ethers.js signer (required for transactions)
});
```

#### `ByzantineDepositWagmiClient`

Initialize the client with wagmi.

```typescript
const client = new ByzantineDepositWagmiClient({
  chainId: number, // Chain ID (1 for Mainnet, 17000 for Holesky)
  wagmiConfig: config, // wagmi config
});
```

### Core Functions

#### Deposit Functions

- `depositETH(amount: bigint)`: Deposit ETH into the Byzantine Deposit contract
- `depositERC20({ token, amount })`: Deposit an ERC20 token into the contract
- `approveToken(token: Address, amount: bigint)`: Approve the contract to spend tokens

#### Withdrawal Functions

- `withdraw({ token, amount, receiver })`: Withdraw tokens from the contract
- `moveToVault({ token, vault, amount, receiver, minSharesOut })`: Move deposited tokens to a Byzantine vault

#### Query Functions

- `isPermissionlessDeposit()`: Returns whether permissionless deposits are enabled
- `canDeposit(address)`: Returns boolean whether a specific address is allowed to deposit
- `isDepositToken(token)`: Returns boolean whether a token is allowed for deposit
- `isByzantineVault(vault)`: Returns boolean whether a vault is a recognized Byzantine vault
- `getDepositedAmount({ address, token })`: Returns the amount of a token deposited by an address
- `getTokenAllowance(token, owner)`: Returns the token allowance for the contract

### Constants

- `ETH_TOKEN_ADDRESS`: The canonical address for ETH (0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)

### Utility Functions

- `getNetworkConfig(chainId)`: Returns the network configuration for the given chain ID
- `formatEther(value)`: Formats a bigint value to ETH string representation
- `parseEther(value)`: Parses an ETH string to bigint

## Supported Networks

- Ethereum Mainnet (Chain ID: 1)
- Holesky Testnet (Chain ID: 17000)

By default, the SDK is configured to use Holesky testnet (Chain ID: 17000). To use Ethereum Mainnet, specify `chainId: 1` when initializing the client.

## Security

All Byzantine Finance contracts have been thoroughly audited. Audit reports can be found in the [Byzantine Finance GitHub repository](https://github.com/Byzantine-Finance/predeposit-contract-ethereum/tree/main/audits).

## License

MIT
