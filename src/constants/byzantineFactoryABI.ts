export const BYZANTINE_FACTORY_ABI = [
  {
    inputs: [
      {
        internalType: "contract IStrategyManager",
        name: "_strategyManager",
        type: "address",
      },
      {
        internalType: "contract IStrategyFactory",
        name: "_strategyFactory",
        type: "address",
      },
      { internalType: "contract IByzETH", name: "_byzETH", type: "address" },
      {
        internalType: "contract IBurnerRouterFactory",
        name: "_burnerRouterFactory",
        type: "address",
      },
      {
        internalType: "contract IVaultConfigurator",
        name: "_vaultConfigurator",
        type: "address",
      },
      {
        internalType: "contract IVaultVersionControl",
        name: "_vaultVersionControl",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "ArrayLengthMismatch", type: "error" },
  { inputs: [], name: "Create2EmptyBytecode", type: "error" },
  { inputs: [], name: "EigenStrategyDoesNotExist", type: "error" },
  { inputs: [], name: "EigenStrategyNotWhitelisted", type: "error" },
  { inputs: [], name: "FailedDeployment", type: "error" },
  {
    inputs: [
      { internalType: "uint256", name: "balance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" },
    ],
    name: "InsufficientBalance",
    type: "error",
  },
  { inputs: [], name: "InvalidDelegatorType", type: "error" },
  { inputs: [], name: "InvalidETHAddress", type: "error" },
  { inputs: [], name: "InvalidInitialization", type: "error" },
  { inputs: [], name: "InvalidSlasherType", type: "error" },
  { inputs: [], name: "NotInitializing", type: "error" },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "collateralToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "eigenByzVault",
        type: "address",
      },
    ],
    name: "EigenByzVaultCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "collateralToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "symByzVault",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "symVault",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "delegator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "slasher",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "burnerRouter",
        type: "address",
      },
    ],
    name: "SymByzVaultCreated",
    type: "event",
  },
  {
    inputs: [],
    name: "burnerRouterFactory",
    outputs: [
      {
        internalType: "contract IBurnerRouterFactory",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "byzETH",
    outputs: [{ internalType: "contract IByzETH", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "contract IERC20", name: "token", type: "address" },
          { internalType: "address", name: "roleManager", type: "address" },
          { internalType: "address", name: "versionManager", type: "address" },
          {
            internalType: "address",
            name: "depositWhitelistManager",
            type: "address",
          },
          {
            internalType: "address",
            name: "depositLimitManager",
            type: "address",
          },
          {
            internalType: "address",
            name: "curatorFeeClaimer",
            type: "address",
          },
          {
            internalType: "address",
            name: "curatorFeeClaimerRoleAdmin",
            type: "address",
          },
          { internalType: "uint256", name: "curatorFee", type: "uint256" },
          { internalType: "uint256", name: "depositLimit", type: "uint256" },
          { internalType: "bool", name: "isDepositLimit", type: "bool" },
          { internalType: "bool", name: "isPrivateVault", type: "bool" },
          { internalType: "bool", name: "isTokenized", type: "bool" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "string", name: "metadataURI", type: "string" },
        ],
        internalType: "struct IByzantineFactory.ByzVaultParams",
        name: "_byzVaultParams",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "address",
            name: "delegationSetRoleHolder",
            type: "address",
          },
          { internalType: "address", name: "operator", type: "address" },
          {
            components: [
              { internalType: "bytes", name: "signature", type: "bytes" },
              { internalType: "uint256", name: "expiry", type: "uint256" },
            ],
            internalType:
              "struct ISignatureUtilsMixinTypes.SignatureWithExpiry",
            name: "approverSignatureAndExpiry",
            type: "tuple",
          },
          { internalType: "bytes32", name: "approverSalt", type: "bytes32" },
        ],
        internalType: "struct IByzantineFactory.EigenParams",
        name: "_eigenParams",
        type: "tuple",
      },
    ],
    name: "createEigenByzVault",
    outputs: [
      { internalType: "address", name: "eigenByzVault", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "contract IERC20",
                name: "token",
                type: "address",
              },
              { internalType: "address", name: "roleManager", type: "address" },
              {
                internalType: "address",
                name: "versionManager",
                type: "address",
              },
              {
                internalType: "address",
                name: "depositWhitelistManager",
                type: "address",
              },
              {
                internalType: "address",
                name: "depositLimitManager",
                type: "address",
              },
              {
                internalType: "address",
                name: "curatorFeeClaimer",
                type: "address",
              },
              {
                internalType: "address",
                name: "curatorFeeClaimerRoleAdmin",
                type: "address",
              },
              { internalType: "uint256", name: "curatorFee", type: "uint256" },
              {
                internalType: "uint256",
                name: "depositLimit",
                type: "uint256",
              },
              { internalType: "bool", name: "isDepositLimit", type: "bool" },
              { internalType: "bool", name: "isPrivateVault", type: "bool" },
              { internalType: "bool", name: "isTokenized", type: "bool" },
              { internalType: "string", name: "name", type: "string" },
              { internalType: "string", name: "symbol", type: "string" },
              { internalType: "string", name: "metadataURI", type: "string" },
            ],
            internalType: "struct IByzantineFactory.ByzVaultParams",
            name: "byzVaultParams",
            type: "tuple",
          },
          { internalType: "bytes32", name: "operatorId", type: "bytes32" },
          {
            internalType: "address[]",
            name: "validatorManagers",
            type: "address[]",
          },
        ],
        internalType: "struct IByzantineFactory.NativeByzVaultParams",
        name: "_nativeByzVaultParams",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "address",
            name: "delegationSetRoleHolder",
            type: "address",
          },
          { internalType: "address", name: "operator", type: "address" },
          {
            components: [
              { internalType: "bytes", name: "signature", type: "bytes" },
              { internalType: "uint256", name: "expiry", type: "uint256" },
            ],
            internalType:
              "struct ISignatureUtilsMixinTypes.SignatureWithExpiry",
            name: "approverSignatureAndExpiry",
            type: "tuple",
          },
          { internalType: "bytes32", name: "approverSalt", type: "bytes32" },
        ],
        internalType: "struct IByzantineFactory.EigenParams",
        name: "_eigenParams",
        type: "tuple",
      },
      {
        components: [
          { internalType: "address", name: "eigenPodOwner", type: "address" },
          { internalType: "address", name: "proofSubmitter", type: "address" },
        ],
        internalType: "struct IByzantineFactory.EigenPodParams",
        name: "_eigenPodParams",
        type: "tuple",
      },
    ],
    name: "createEigenByzVault",
    outputs: [
      { internalType: "address", name: "eigenByzVault", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "contract IERC20", name: "token", type: "address" },
          { internalType: "address", name: "roleManager", type: "address" },
          { internalType: "address", name: "versionManager", type: "address" },
          {
            internalType: "address",
            name: "depositWhitelistManager",
            type: "address",
          },
          {
            internalType: "address",
            name: "depositLimitManager",
            type: "address",
          },
          {
            internalType: "address",
            name: "curatorFeeClaimer",
            type: "address",
          },
          {
            internalType: "address",
            name: "curatorFeeClaimerRoleAdmin",
            type: "address",
          },
          { internalType: "uint256", name: "curatorFee", type: "uint256" },
          { internalType: "uint256", name: "depositLimit", type: "uint256" },
          { internalType: "bool", name: "isDepositLimit", type: "bool" },
          { internalType: "bool", name: "isPrivateVault", type: "bool" },
          { internalType: "bool", name: "isTokenized", type: "bool" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "string", name: "metadataURI", type: "string" },
        ],
        internalType: "struct IByzantineFactory.ByzVaultParams",
        name: "_byzVaultParams",
        type: "tuple",
      },
      {
        components: [
          {
            components: [
              { internalType: "address", name: "owner", type: "address" },
              { internalType: "uint48", name: "delay", type: "uint48" },
              {
                internalType: "address",
                name: "globalReceiver",
                type: "address",
              },
              {
                components: [
                  { internalType: "address", name: "network", type: "address" },
                  {
                    internalType: "address",
                    name: "receiver",
                    type: "address",
                  },
                ],
                internalType: "struct IBurnerRouter.NetworkReceiver[]",
                name: "networkReceivers",
                type: "tuple[]",
              },
              {
                components: [
                  { internalType: "address", name: "network", type: "address" },
                  {
                    internalType: "address",
                    name: "operator",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "receiver",
                    type: "address",
                  },
                ],
                internalType: "struct IBurnerRouter.OperatorNetworkReceiver[]",
                name: "operatorNetworkReceivers",
                type: "tuple[]",
              },
            ],
            internalType: "struct IByzantineFactory.BurnerParams",
            name: "burnerParams",
            type: "tuple",
          },
          {
            components: [
              { internalType: "address", name: "owner", type: "address" },
              { internalType: "uint64", name: "version", type: "uint64" },
              { internalType: "uint48", name: "epochDuration", type: "uint48" },
            ],
            internalType: "struct IByzantineFactory.VaultParams",
            name: "vaultParams",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "enum IByzantineFactory.DelegatorType",
                name: "delegatorType",
                type: "uint8",
              },
              { internalType: "address", name: "hook", type: "address" },
              {
                internalType: "address",
                name: "hookSetRoleHolder",
                type: "address",
              },
              {
                internalType: "address[]",
                name: "networkLimitSetRoleHolders",
                type: "address[]",
              },
              {
                internalType: "address[]",
                name: "operatorNetworkLimitOrSharesSetRoleHolders",
                type: "address[]",
              },
              { internalType: "address", name: "operator", type: "address" },
              { internalType: "address", name: "network", type: "address" },
            ],
            internalType: "struct IByzantineFactory.DelegatorParams",
            name: "delegatorParams",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "enum IByzantineFactory.SlasherType",
                name: "slasherType",
                type: "uint8",
              },
              { internalType: "uint48", name: "vetoDuration", type: "uint48" },
              {
                internalType: "uint256",
                name: "resolverSetEpochsDelay",
                type: "uint256",
              },
            ],
            internalType: "struct IByzantineFactory.SlasherParams",
            name: "slasherParams",
            type: "tuple",
          },
        ],
        internalType: "struct IByzantineFactory.SymParams",
        name: "_symParams",
        type: "tuple",
      },
    ],
    name: "createSymByzVault",
    outputs: [
      { internalType: "address", name: "symByzVault", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "contract IERC20",
                name: "token",
                type: "address",
              },
              { internalType: "address", name: "roleManager", type: "address" },
              {
                internalType: "address",
                name: "versionManager",
                type: "address",
              },
              {
                internalType: "address",
                name: "depositWhitelistManager",
                type: "address",
              },
              {
                internalType: "address",
                name: "depositLimitManager",
                type: "address",
              },
              {
                internalType: "address",
                name: "curatorFeeClaimer",
                type: "address",
              },
              {
                internalType: "address",
                name: "curatorFeeClaimerRoleAdmin",
                type: "address",
              },
              { internalType: "uint256", name: "curatorFee", type: "uint256" },
              {
                internalType: "uint256",
                name: "depositLimit",
                type: "uint256",
              },
              { internalType: "bool", name: "isDepositLimit", type: "bool" },
              { internalType: "bool", name: "isPrivateVault", type: "bool" },
              { internalType: "bool", name: "isTokenized", type: "bool" },
              { internalType: "string", name: "name", type: "string" },
              { internalType: "string", name: "symbol", type: "string" },
              { internalType: "string", name: "metadataURI", type: "string" },
            ],
            internalType: "struct IByzantineFactory.ByzVaultParams",
            name: "byzVaultParams",
            type: "tuple",
          },
          { internalType: "bytes32", name: "operatorId", type: "bytes32" },
          {
            internalType: "address[]",
            name: "validatorManagers",
            type: "address[]",
          },
        ],
        internalType: "struct IByzantineFactory.NativeByzVaultParams",
        name: "_nativeByzVaultParams",
        type: "tuple",
      },
      {
        components: [
          {
            components: [
              { internalType: "address", name: "owner", type: "address" },
              { internalType: "uint48", name: "delay", type: "uint48" },
              {
                internalType: "address",
                name: "globalReceiver",
                type: "address",
              },
              {
                components: [
                  { internalType: "address", name: "network", type: "address" },
                  {
                    internalType: "address",
                    name: "receiver",
                    type: "address",
                  },
                ],
                internalType: "struct IBurnerRouter.NetworkReceiver[]",
                name: "networkReceivers",
                type: "tuple[]",
              },
              {
                components: [
                  { internalType: "address", name: "network", type: "address" },
                  {
                    internalType: "address",
                    name: "operator",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "receiver",
                    type: "address",
                  },
                ],
                internalType: "struct IBurnerRouter.OperatorNetworkReceiver[]",
                name: "operatorNetworkReceivers",
                type: "tuple[]",
              },
            ],
            internalType: "struct IByzantineFactory.BurnerParams",
            name: "burnerParams",
            type: "tuple",
          },
          {
            components: [
              { internalType: "address", name: "owner", type: "address" },
              { internalType: "uint64", name: "version", type: "uint64" },
              { internalType: "uint48", name: "epochDuration", type: "uint48" },
            ],
            internalType: "struct IByzantineFactory.VaultParams",
            name: "vaultParams",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "enum IByzantineFactory.DelegatorType",
                name: "delegatorType",
                type: "uint8",
              },
              { internalType: "address", name: "hook", type: "address" },
              {
                internalType: "address",
                name: "hookSetRoleHolder",
                type: "address",
              },
              {
                internalType: "address[]",
                name: "networkLimitSetRoleHolders",
                type: "address[]",
              },
              {
                internalType: "address[]",
                name: "operatorNetworkLimitOrSharesSetRoleHolders",
                type: "address[]",
              },
              { internalType: "address", name: "operator", type: "address" },
              { internalType: "address", name: "network", type: "address" },
            ],
            internalType: "struct IByzantineFactory.DelegatorParams",
            name: "delegatorParams",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "enum IByzantineFactory.SlasherType",
                name: "slasherType",
                type: "uint8",
              },
              { internalType: "uint48", name: "vetoDuration", type: "uint48" },
              {
                internalType: "uint256",
                name: "resolverSetEpochsDelay",
                type: "uint256",
              },
            ],
            internalType: "struct IByzantineFactory.SlasherParams",
            name: "slasherParams",
            type: "tuple",
          },
        ],
        internalType: "struct IByzantineFactory.SymParams",
        name: "_symParams",
        type: "tuple",
      },
    ],
    name: "createSymByzVault",
    outputs: [
      { internalType: "address", name: "symByzVault", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_initialOwner", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_creator", type: "address" },
      {
        internalType: "enum IVaultVersionControl.VaultType",
        name: "_vaultType",
        type: "uint8",
      },
      { internalType: "uint64", name: "_version", type: "uint64" },
    ],
    name: "preCalculateByzVaultAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "contract IERC20[]", name: "_token", type: "address[]" },
      {
        internalType: "contract IStrategy[]",
        name: "_strategy",
        type: "address[]",
      },
    ],
    name: "setTokenToEigenStrategy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "strategyFactory",
    outputs: [
      { internalType: "contract IStrategyFactory", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "strategyManager",
    outputs: [
      { internalType: "contract IStrategyManager", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "vaultConfigurator",
    outputs: [
      {
        internalType: "contract IVaultConfigurator",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vaultVersionControl",
    outputs: [
      {
        internalType: "contract IVaultVersionControl",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
