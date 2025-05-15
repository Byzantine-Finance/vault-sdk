export const BYZANTINE_FACTORY_ABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_strategyManager",
        type: "address",
        internalType: "contract IStrategyManager",
      },
      {
        name: "_strategyFactory",
        type: "address",
        internalType: "contract IStrategyFactory",
      },
      {
        name: "_burnerRouterFactory",
        type: "address",
        internalType: "contract IBurnerRouterFactory",
      },
      {
        name: "_vaultConfigurator",
        type: "address",
        internalType: "contract IVaultConfigurator",
      },
      {
        name: "_vaultVersionControl",
        type: "address",
        internalType: "contract IVaultVersionControl",
      },
      {
        name: "_stakingOracle",
        type: "address",
        internalType: "contract IStakingOracle",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "burnerRouterFactory",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IBurnerRouterFactory",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createEigenByzVault",
    inputs: [
      {
        name: "_byzVaultParams",
        type: "tuple",
        internalType: "struct IByzantineFactory.ByzVaultParams",
        components: [
          { name: "token", type: "address", internalType: "contract IERC20" },
          { name: "roleManager", type: "address", internalType: "address" },
          { name: "versionManager", type: "address", internalType: "address" },
          {
            name: "depositWhitelistManager",
            type: "address",
            internalType: "address",
          },
          {
            name: "depositLimitManager",
            type: "address",
            internalType: "address",
          },
          {
            name: "curatorFeeClaimer",
            type: "address",
            internalType: "address",
          },
          {
            name: "curatorFeeClaimerRoleAdmin",
            type: "address",
            internalType: "address",
          },
          { name: "depositLimit", type: "uint256", internalType: "uint256" },
          { name: "curatorFee", type: "uint16", internalType: "uint16" },
          { name: "isDepositLimit", type: "bool", internalType: "bool" },
          { name: "isPrivateVault", type: "bool", internalType: "bool" },
          { name: "isTokenized", type: "bool", internalType: "bool" },
          { name: "name", type: "string", internalType: "string" },
          { name: "symbol", type: "string", internalType: "string" },
          { name: "metadataURI", type: "string", internalType: "string" },
        ],
      },
      {
        name: "_eigenParams",
        type: "tuple",
        internalType: "struct IByzantineFactory.EigenParams",
        components: [
          {
            name: "delegationSetRoleHolder",
            type: "address",
            internalType: "address",
          },
          { name: "operator", type: "address", internalType: "address" },
          {
            name: "approverSignatureAndExpiry",
            type: "tuple",
            internalType:
              "struct ISignatureUtilsMixinTypes.SignatureWithExpiry",
            components: [
              { name: "signature", type: "bytes", internalType: "bytes" },
              { name: "expiry", type: "uint256", internalType: "uint256" },
            ],
          },
          { name: "approverSalt", type: "bytes32", internalType: "bytes32" },
        ],
      },
    ],
    outputs: [
      { name: "eigenByzVault", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createEigenByzVault",
    inputs: [
      {
        name: "_nativeByzVaultParams",
        type: "tuple",
        internalType: "struct IByzantineFactory.NativeByzVaultParams",
        components: [
          {
            name: "byzVaultParams",
            type: "tuple",
            internalType: "struct IByzantineFactory.ByzVaultParams",
            components: [
              {
                name: "token",
                type: "address",
                internalType: "contract IERC20",
              },
              { name: "roleManager", type: "address", internalType: "address" },
              {
                name: "versionManager",
                type: "address",
                internalType: "address",
              },
              {
                name: "depositWhitelistManager",
                type: "address",
                internalType: "address",
              },
              {
                name: "depositLimitManager",
                type: "address",
                internalType: "address",
              },
              {
                name: "curatorFeeClaimer",
                type: "address",
                internalType: "address",
              },
              {
                name: "curatorFeeClaimerRoleAdmin",
                type: "address",
                internalType: "address",
              },
              {
                name: "depositLimit",
                type: "uint256",
                internalType: "uint256",
              },
              { name: "curatorFee", type: "uint16", internalType: "uint16" },
              { name: "isDepositLimit", type: "bool", internalType: "bool" },
              { name: "isPrivateVault", type: "bool", internalType: "bool" },
              { name: "isTokenized", type: "bool", internalType: "bool" },
              { name: "name", type: "string", internalType: "string" },
              { name: "symbol", type: "string", internalType: "string" },
              { name: "metadataURI", type: "string", internalType: "string" },
            ],
          },
          { name: "operatorId", type: "bytes32", internalType: "bytes32" },
          { name: "soloStakingFee", type: "uint16", internalType: "uint16" },
          {
            name: "validatorManagers",
            type: "address[]",
            internalType: "address[]",
          },
        ],
      },
      {
        name: "_eigenParams",
        type: "tuple",
        internalType: "struct IByzantineFactory.EigenParams",
        components: [
          {
            name: "delegationSetRoleHolder",
            type: "address",
            internalType: "address",
          },
          { name: "operator", type: "address", internalType: "address" },
          {
            name: "approverSignatureAndExpiry",
            type: "tuple",
            internalType:
              "struct ISignatureUtilsMixinTypes.SignatureWithExpiry",
            components: [
              { name: "signature", type: "bytes", internalType: "bytes" },
              { name: "expiry", type: "uint256", internalType: "uint256" },
            ],
          },
          { name: "approverSalt", type: "bytes32", internalType: "bytes32" },
        ],
      },
    ],
    outputs: [
      { name: "eigenByzVault", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createSuperERC20Vault",
    inputs: [
      {
        name: "_params",
        type: "tuple",
        internalType: "struct ISuperERC20Vault.SuperVaultParams",
        components: [
          {
            name: "byzVaultParams",
            type: "tuple",
            internalType: "struct IByzantineFactory.ByzVaultParams",
            components: [
              {
                name: "token",
                type: "address",
                internalType: "contract IERC20",
              },
              { name: "roleManager", type: "address", internalType: "address" },
              {
                name: "versionManager",
                type: "address",
                internalType: "address",
              },
              {
                name: "depositWhitelistManager",
                type: "address",
                internalType: "address",
              },
              {
                name: "depositLimitManager",
                type: "address",
                internalType: "address",
              },
              {
                name: "curatorFeeClaimer",
                type: "address",
                internalType: "address",
              },
              {
                name: "curatorFeeClaimerRoleAdmin",
                type: "address",
                internalType: "address",
              },
              {
                name: "depositLimit",
                type: "uint256",
                internalType: "uint256",
              },
              { name: "curatorFee", type: "uint16", internalType: "uint16" },
              { name: "isDepositLimit", type: "bool", internalType: "bool" },
              { name: "isPrivateVault", type: "bool", internalType: "bool" },
              { name: "isTokenized", type: "bool", internalType: "bool" },
              { name: "name", type: "string", internalType: "string" },
              { name: "symbol", type: "string", internalType: "string" },
              { name: "metadataURI", type: "string", internalType: "string" },
            ],
          },
          { name: "symRatio", type: "uint256", internalType: "uint256" },
          {
            name: "eigenParams",
            type: "tuple",
            internalType: "struct IByzantineFactory.EigenParams",
            components: [
              {
                name: "delegationSetRoleHolder",
                type: "address",
                internalType: "address",
              },
              { name: "operator", type: "address", internalType: "address" },
              {
                name: "approverSignatureAndExpiry",
                type: "tuple",
                internalType:
                  "struct ISignatureUtilsMixinTypes.SignatureWithExpiry",
                components: [
                  { name: "signature", type: "bytes", internalType: "bytes" },
                  { name: "expiry", type: "uint256", internalType: "uint256" },
                ],
              },
              {
                name: "approverSalt",
                type: "bytes32",
                internalType: "bytes32",
              },
            ],
          },
          {
            name: "symParams",
            type: "tuple",
            internalType: "struct IByzantineFactory.SymParams",
            components: [
              {
                name: "burnerParams",
                type: "tuple",
                internalType: "struct IByzantineFactory.BurnerParams",
                components: [
                  { name: "owner", type: "address", internalType: "address" },
                  { name: "delay", type: "uint48", internalType: "uint48" },
                  {
                    name: "globalReceiver",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "networkReceivers",
                    type: "tuple[]",
                    internalType: "struct IBurnerRouter.NetworkReceiver[]",
                    components: [
                      {
                        name: "network",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "receiver",
                        type: "address",
                        internalType: "address",
                      },
                    ],
                  },
                  {
                    name: "operatorNetworkReceivers",
                    type: "tuple[]",
                    internalType:
                      "struct IBurnerRouter.OperatorNetworkReceiver[]",
                    components: [
                      {
                        name: "network",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "operator",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "receiver",
                        type: "address",
                        internalType: "address",
                      },
                    ],
                  },
                ],
              },
              {
                name: "vaultParams",
                type: "tuple",
                internalType: "struct IByzantineFactory.VaultParams",
                components: [
                  { name: "version", type: "uint64", internalType: "uint64" },
                  {
                    name: "epochDuration",
                    type: "uint48",
                    internalType: "uint48",
                  },
                ],
              },
              {
                name: "delegatorParams",
                type: "tuple",
                internalType: "struct IByzantineFactory.DelegatorParams",
                components: [
                  {
                    name: "delegatorType",
                    type: "uint8",
                    internalType: "enum IByzantineFactory.DelegatorType",
                  },
                  { name: "hook", type: "address", internalType: "address" },
                  {
                    name: "hookSetRoleHolder",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "networkLimitSetRoleHolders",
                    type: "address[]",
                    internalType: "address[]",
                  },
                  {
                    name: "operatorNetworkLimitOrSharesSetRoleHolders",
                    type: "address[]",
                    internalType: "address[]",
                  },
                  {
                    name: "operator",
                    type: "address",
                    internalType: "address",
                  },
                  { name: "network", type: "address", internalType: "address" },
                ],
              },
              {
                name: "slasherParams",
                type: "tuple",
                internalType: "struct IByzantineFactory.SlasherParams",
                components: [
                  {
                    name: "slasherType",
                    type: "uint8",
                    internalType: "enum IByzantineFactory.SlasherType",
                  },
                  {
                    name: "vetoDuration",
                    type: "uint48",
                    internalType: "uint48",
                  },
                  {
                    name: "resolverSetEpochsDelay",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
          { name: "curator", type: "address", internalType: "address" },
        ],
      },
    ],
    outputs: [{ name: "superVault", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createSymByzVault",
    inputs: [
      {
        name: "_byzVaultParams",
        type: "tuple",
        internalType: "struct IByzantineFactory.ByzVaultParams",
        components: [
          { name: "token", type: "address", internalType: "contract IERC20" },
          { name: "roleManager", type: "address", internalType: "address" },
          { name: "versionManager", type: "address", internalType: "address" },
          {
            name: "depositWhitelistManager",
            type: "address",
            internalType: "address",
          },
          {
            name: "depositLimitManager",
            type: "address",
            internalType: "address",
          },
          {
            name: "curatorFeeClaimer",
            type: "address",
            internalType: "address",
          },
          {
            name: "curatorFeeClaimerRoleAdmin",
            type: "address",
            internalType: "address",
          },
          { name: "depositLimit", type: "uint256", internalType: "uint256" },
          { name: "curatorFee", type: "uint16", internalType: "uint16" },
          { name: "isDepositLimit", type: "bool", internalType: "bool" },
          { name: "isPrivateVault", type: "bool", internalType: "bool" },
          { name: "isTokenized", type: "bool", internalType: "bool" },
          { name: "name", type: "string", internalType: "string" },
          { name: "symbol", type: "string", internalType: "string" },
          { name: "metadataURI", type: "string", internalType: "string" },
        ],
      },
      {
        name: "_symParams",
        type: "tuple",
        internalType: "struct IByzantineFactory.SymParams",
        components: [
          {
            name: "burnerParams",
            type: "tuple",
            internalType: "struct IByzantineFactory.BurnerParams",
            components: [
              { name: "owner", type: "address", internalType: "address" },
              { name: "delay", type: "uint48", internalType: "uint48" },
              {
                name: "globalReceiver",
                type: "address",
                internalType: "address",
              },
              {
                name: "networkReceivers",
                type: "tuple[]",
                internalType: "struct IBurnerRouter.NetworkReceiver[]",
                components: [
                  { name: "network", type: "address", internalType: "address" },
                  {
                    name: "receiver",
                    type: "address",
                    internalType: "address",
                  },
                ],
              },
              {
                name: "operatorNetworkReceivers",
                type: "tuple[]",
                internalType: "struct IBurnerRouter.OperatorNetworkReceiver[]",
                components: [
                  { name: "network", type: "address", internalType: "address" },
                  {
                    name: "operator",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "receiver",
                    type: "address",
                    internalType: "address",
                  },
                ],
              },
            ],
          },
          {
            name: "vaultParams",
            type: "tuple",
            internalType: "struct IByzantineFactory.VaultParams",
            components: [
              { name: "version", type: "uint64", internalType: "uint64" },
              { name: "epochDuration", type: "uint48", internalType: "uint48" },
            ],
          },
          {
            name: "delegatorParams",
            type: "tuple",
            internalType: "struct IByzantineFactory.DelegatorParams",
            components: [
              {
                name: "delegatorType",
                type: "uint8",
                internalType: "enum IByzantineFactory.DelegatorType",
              },
              { name: "hook", type: "address", internalType: "address" },
              {
                name: "hookSetRoleHolder",
                type: "address",
                internalType: "address",
              },
              {
                name: "networkLimitSetRoleHolders",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "operatorNetworkLimitOrSharesSetRoleHolders",
                type: "address[]",
                internalType: "address[]",
              },
              { name: "operator", type: "address", internalType: "address" },
              { name: "network", type: "address", internalType: "address" },
            ],
          },
          {
            name: "slasherParams",
            type: "tuple",
            internalType: "struct IByzantineFactory.SlasherParams",
            components: [
              {
                name: "slasherType",
                type: "uint8",
                internalType: "enum IByzantineFactory.SlasherType",
              },
              { name: "vetoDuration", type: "uint48", internalType: "uint48" },
              {
                name: "resolverSetEpochsDelay",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
        ],
      },
    ],
    outputs: [
      { name: "symByzVault", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      { name: "_initialOwner", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "preCalculateByzVaultAddress",
    inputs: [
      { name: "_creator", type: "address", internalType: "address" },
      {
        name: "_vaultType",
        type: "uint8",
        internalType: "enum IVaultVersionControl.VaultType",
      },
      { name: "_version", type: "uint64", internalType: "uint64" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setTokenToEigenStrategy",
    inputs: [
      { name: "_token", type: "address[]", internalType: "contract IERC20[]" },
      {
        name: "_strategy",
        type: "address[]",
        internalType: "contract IStrategy[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stakingOracle",
    inputs: [],
    outputs: [
      { name: "", type: "address", internalType: "contract IStakingOracle" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "strategyFactory",
    inputs: [],
    outputs: [
      { name: "", type: "address", internalType: "contract IStrategyFactory" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "strategyManager",
    inputs: [],
    outputs: [
      { name: "", type: "address", internalType: "contract IStrategyManager" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "vaultConfigurator",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IVaultConfigurator",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vaultVersionControl",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IVaultVersionControl",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "EigenByzVaultCreated",
    inputs: [
      {
        name: "creator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "collateralToken",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "eigenByzVault",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SuperERC20VaultCreated",
    inputs: [
      {
        name: "creator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "collateralToken",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "superERC20Vault",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "symVault",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "eigenVault",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SymByzVaultCreated",
    inputs: [
      {
        name: "creator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "collateralToken",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "symByzVault",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "symVault",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "delegator",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "slasher",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "burnerRouter",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "ArrayLengthMismatch", inputs: [] },
  { type: "error", name: "Create2EmptyBytecode", inputs: [] },
  { type: "error", name: "EigenStrategyDoesNotExist", inputs: [] },
  { type: "error", name: "EigenStrategyNotWhitelisted", inputs: [] },
  { type: "error", name: "FailedDeployment", inputs: [] },
  {
    type: "error",
    name: "InsufficientBalance",
    inputs: [
      { name: "balance", type: "uint256", internalType: "uint256" },
      { name: "needed", type: "uint256", internalType: "uint256" },
    ],
  },
  { type: "error", name: "InvalidDelegatorType", inputs: [] },
  { type: "error", name: "InvalidETHAddress", inputs: [] },
  { type: "error", name: "InvalidInitialization", inputs: [] },
  { type: "error", name: "InvalidSlasherType", inputs: [] },
  { type: "error", name: "NotInitializing", inputs: [] },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
  },
];
