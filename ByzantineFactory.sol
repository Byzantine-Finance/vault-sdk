// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import {IStrategy} from "eigenlayer-contracts/interfaces/IStrategy.sol";
// import {ISignatureUtilsMixinTypes} from "eigenlayer-contracts/interfaces/ISignatureUtilsMixin.sol";
// import {IBurnerRouter} from "@symbioticfi/burners/src/interfaces/router/IBurnerRouter.sol";
// import {IVaultVersionControl} from "./IVaultVersionControl.sol";
// import {ISuperERC20Vault} from "./ISuperERC20Vault.sol";

// interface IByzantineFactory {
//     /* ============================= EVENTS ============================= */

//     /// @notice Emitted when an EigenByzVault is created
//     event EigenByzVaultCreated(address indexed creator, address indexed collateralToken, address indexed eigenByzVault);

//     /// @notice Emitted when a SymByzVault is created
//     event SymByzVaultCreated(
//         address indexed creator,
//         address indexed collateralToken,
//         address symVault,
//         address delegator,
//         address slasher,
//         address burnerRouter
//     );

//     /// @notice Emitted when a BurnerRouter is created
//     event SymBurnerRouter(
//         address owner,
//         uint48 delay,
//         address globalReceiver,
//         IBurnerRouter.NetworkReceiver[] networkReceivers,
//         IBurnerRouter.OperatorNetworkReceiver[] operatorNetworkReceivers
//     );

//     /// @notice Emitted when a hook is set
//     event SymHook(address hook, address hookSetRoleHolder);

//     /// @notice Emitted when a Network Restake or Full Restake Delegator is created
//     event SymNRFRDelegator(
//         DelegatorType delegatorType,
//         address[] networkLimitSetRoleHolders,
//         address[] operatorNetworkLimitOrSharesSetRoleHolders
//     );

//     /// @notice Emitted when a Symbiotic Operator Specific Delegator is created
//     event SymOSDelegator(DelegatorType delegatorType, address[] networkLimitSetRoleHolders, address operator);

//     /// @notice Emitted when a Symbiotic Operator Network Specific Delegator is created
//     event SymONSDelegator(DelegatorType delegatorType, address network, address operator);

//     /// @notice Emitted when a Symbiotic Instant Slasher is created
//     event SymInstantSlasher(SlasherType slasherType);

//     /// @notice Emitted when a Symbiotic Veto Slasher is created
//     event SymVetoSlasher(SlasherType slasherType, uint48 vetoDuration, uint256 resolverSetEpochsDelay);

//     /// @notice Emitted when a Symbiotic Vault is created
//     event SymVault(address symVaultOwner, uint64 version, uint48 epochDuration);

//     /// @notice Emitted when a SuperERC20Vault is created
//     event SuperERC20VaultCreated(
//         address indexed creator,
//         address indexed collateralToken,
//         address indexed superERC20Vault,
//         address symVault,
//         address eigenVault
//     );

//     /* ===================== SYMBIOTIC ENUMS ===================== */

//     /**
//      * @notice Enum to choose the type of Symbiotic Delegator to deploy
//      * @dev Delegator type specifications:
//      *
//      *      NETWORK_RESTAKE (TYPE 0):
//      *          - It accounts for allocations in absolute numbers for networks and in shares for operator-network pairs
//      *          - Allows restaking across the networks (depending on the delegated amounts) but not within the same network, among the operators.
//      *          - Note that operators and networks set and delegated amounts can be changed at any time by the role holders
//      *
//      *      FULL_RESTAKE (TYPE 1):
//      *          - It accounts for allocations in absolute numbers for both: networks and operator-network pairs
//      *          - Allows everything that NetworkRestakeDelegator does, at the only difference that restaking across the operators inside the networks is possible
//      *          - Note that operators and networks set and delegated amounts can be changed at any time by the role holders
//      *
//      *      OPERATOR_SPECIFIC (TYPE 2):
//      *          - It is a simplified version of NetworkRestakeDelegator where only one specific operator has allocations
//      *          - Allows restaking across the networks only if the operator opts-in for the networks
//      *          - Note that once set, the operator cannot be changed. However, networks set and delegated amounts can be changed at any time by the role holders.
//      *
//      *      OPERATOR_NETWORK_SPECIFIC (TYPE 3):
//      *          - It is the most simple version where only one specific operator at one specific network has an allocation
//      *          - Allows staking on 1 network to 1 operator
//      *          - Note that once set, the operator and the network cannot be changed.
//      *
//      */
//     enum DelegatorType {
//         NETWORK_RESTAKE,
//         FULL_RESTAKE,
//         OPERATOR_SPECIFIC,
//         OPERATOR_NETWORK_SPECIFIC
//     }

//     /**
//      * @notice Enum to choose the type of Symbiotic Slasher to deploy
//      * @dev All slashers have `isBurnerHook` set to true to trigger the onSlash() function of the BurnerRouter if a slashing event occurs
//      * @dev Slasher type specifications:
//      *
//      *      INSTANT (TYPE 0):
//      *          - Common Slasher that receives slashing requests and instantly executes them
//      *
//      *      VETO (TYPE 1):
//      *          - Allows to veto received slashing requests using resolvers
//      *          - Only networks can set resolvers that can veto the slashing requests
//      *          - /!\ It is also possible for the networks not to set a resolver, thus enabling an instant slashing mechanic similar to Instant Slasher's.
//      *          - If the Vault curator is not ready to provide a stake without the resolver, the curator may simply not allocate any stake to such networks.
//      *
//      */
//     enum SlasherType {
//         INSTANT,
//         VETO
//     }

//     /* ===================== INIT STRUCTS ===================== */

//     /// @notice The list of Validator Managers for the Solo Staker Vaults
//     /// @dev The field is ONLY used if `operatorId` is bytes32(0)
//     /// - `address(0)` for DV Vaults and Partner Validated Vaults
//     /// @dev The stored addresses cannot be removed from the array so the solo staker should choose them wisely
//     ///  address[] validatorManagers;

//     /// @notice The address that manages the whitelist of depositors
//     /// @dev This address can:
//     ///      - add / remove addresses from the whitelist
//     ///      - set / change the vault from public to private or vice versa
//     ///      - transfer the whitelist admin role to a new address
//     /// address whitelistAdmin;

//     /// @notice The address of the ProxyAdmin owner of the vault:
//     /// @dev This address can:
//     ///      - upgrade the vault to a new version of implementation
//     ///      - update the metadata URI of the vault
//     ///      - add a new validator manager to the validatorManagers array
//     /// address proxyOwner;

//     /// @notice Address of the enabler/disabler of the deposit limit.
//     /// @dev If isDepositLimit is set to true, a depositLimit has to be set as well, otherwise it will be 0 and all NEW deposits will be rejected.
//     /// @dev The role holder cannot be changed once set, so choose it wisely.
//     /// address isDepositLimitSetRoleHolder;
//     /// @notice Address of the role holder that can set the deposit limit.
//     /// @dev Is not taken into account if isDepositLimit is false.
//     /// @dev The role holder cannot be changed once set, so choose it wisely.
//     /// address depositLimitSetRoleHolder;

//     /// @notice Init struct common to all the ERC20 Byz Vaults
//     struct ByzVaultParams {
//         /// @notice The ERC20 token to deposit
//         /// @dev The underlying EigenLayer Strategy has to be whitelisted to create a Byz Vault for this token
//         /// @dev Canonical address of the Beacon Chain ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
//         IERC20 token;
//         /// @notice The admin of all the roles granted to different role holders in the Byz Vault, except for the curatorFeeClaimer
//         /// @dev In the AccessControl contract, this is the address that the role DEFAULT_ADMIN_ROLE is granted to
//         /// @dev This address can:
//         ///      - grant any existing role to a new address
//         ///      - renounce its own roleManager role and grant it to a new address
//         ///      - revoke any existing role from an address
//         address roleManager;
//         /// @notice The address of Byz Vault's version manager
//         /// @dev This address can:
//         ///      - upgrade the Byz Vault to a newer version of implementation that is whitelisted by Byzantine
//         ///      - update the metadata URI of the vault
//         /// @dev This role can be managed by the roleManager
//         address versionManager;
//         /// @notice The address that manages the whitelist of depositors
//         /// @dev This address can:
//         ///     - add / remove addresses from the whitelist
//         ///     - set / change the vault from public to private or vice versa
//         /// @dev Can be set to address(0) if `whitelistedDeposit` is false and the creator plans to let anyone deposit
//         /// @dev This role can be managed by the roleManager
//         address depositWhitelistManager;
//         /// @notice Address that can set depositLimit and enable/disable the isDepositLimit status
//         /// @dev This role can be managed by the roleManager
//         address depositLimitManager;
//         /// @notice Address that is the holder of the CURATOR_FEE_CLAIMER_ROLE, can claim the curator fee from the restaking rewards
//         /// @dev Only the curatorFeeClaimerRoleAdmin address can manage this role
//         /// @dev This role cannot be managed by the roleManager
//         address curatorFeeClaimer;
//         /// @notice Address of the admin role of the CURATOR_FEE_CLAIMER_ROLE
//         /// @dev This role holder can:
//         ///     - renounce its own admin role
//         ///     - revoke the CURATOR_FEE_CLAIMER_ROLE from its holder
//         ///     - grant the CURATOR_FEE_CLAIMER_ROLE to a new address
//         address curatorFeeClaimerRoleAdmin;
//         /// @notice Fee taken by the vault curator / risk manager (10% = 1_000 | 100% = 10_000)
//         /// @dev This fee cannot be changed once set /// TODO Change this point
//         uint256 curatorFee;
//         /// @notice The maximum amount of assets that can be deposited into the Byz Vault
//         /// @dev Only used if `isDepositLimit` is true
//         /// @dev If isDepositLimit is set to true, a depositLimit has to be set as well, otherwise it will be 0 and all NEW deposits will be rejected.
//         /// @dev Only the depositLimitManager can set this
//         uint256 depositLimit;
//         /// @notice If true, the vault has maximum amount of assets that can be deposited
//         ///         If false, an infinite number of assets can be deposited (theoretically)
//         /// @dev Only the depositLimitManager can set this
//         bool isDepositLimit;
//         /// @notice Whether deposits into the Byz Vault are permissioned or not
//         /// @dev If true, only the addresses that are set to true in the canDeposit mapping can deposit into the Byz Vault
//         /// @dev Only the depositWhitelistManager can set this
//         bool isPrivateVault;
//         /// @notice Whether the Byz Vault is tokenized or not
//         /// @dev If the Byz Vault is tokenized, the byzShares holders can transfer them to other addresses
//         bool isTokenized;
//         /// @notice The name of the Byz Vaults shares
//         string name;
//         /// @notice The symbol of the Byz Vaults shares
//         string symbol;
//         /// @notice The metadata URI to store the vault's metadata
//         /// @dev Only the versionManager can set this
//         /// @dev This string is not stored on-chain, only an event is emitted
//         string metadataURI;
//     }

//     /// @notice Init struct common to all the Native Byz Vaults (extension of the ByzVaultParams struct)
//     struct NativeByzVaultParams {
//         /// @notice Common parameters for all the Byz Vaults
//         ByzVaultParams byzVaultParams;
//         /// @notice The id of the node operator that will handle the Ethereum Validator for the staking:
//         ///         - hash("distributed.validator.vault") for DV Vaults
//         ///         - hash("company.name") for Partner Validated Vaults
//         ///         - bytes32(0) for Solo Staker Vaults
//         /// @dev More details in the OperatorRegistry contract
//         bytes32 operatorId;
//         /// @notice The list of Validator Managers for the Solo Staker Vaults
//         /// @dev The field is ONLY used if `operatorId` is bytes32(0)
//         ///      Let it empty otherwise
//         /// @dev The stored addresses cannot be removed from the array so the solo staker should choose them wisely
//         address[] validatorManagers;
//     }

//     /// @notice Init struct for the Eigen Layer parameters (used for the Eigen Byz Vaults)
//     struct EigenParams {
//         /// @notice The address of the role holder that manages the Eigen Layer delegation - the chosen operator to delegate to
//         /// @dev This address can:
//         ///     - delegate the Byz Vault's stake to an operator
//         ///     - undelegate the Byz Vault's stake from an operator
//         ///     - redelegate the Byz Vault's stake to a different operator
//         address delegationSetRoleHolder;
//         /// @notice The address of the Eigen Layer operator to delegate to (operator running the underlying restaking strategy)
//         ///         It is possible to delegate to an operator after the Byz Vault creation. In that case, set the parameter to address(0).
//         address operator;
//         /// @notice (optional) Verifies the operator approves of this delegation
//         /// @dev Is only used if vault's creator has chosen an operator AND the operator has configured a delegationApprover.
//         ISignatureUtilsMixinTypes.SignatureWithExpiry approverSignatureAndExpiry;
//         /// @notice (optional) A unique single use value tied to an individual signature
//         /// @dev Is only used if vault's creator has chosen an operator AND the operator has configured a delegationApprover.
//         bytes32 approverSalt;
//     }

//     /// @notice Init struct for the EigenPod parameters (used for the Eigen Native Byz Vaults)
//     struct EigenPodParams {
//         /// @notice The address of the owner of the EigenPod tied to a Native Byz Vault
//         /// @dev This address can:
//         ///     - start a pod checkpoint
//         ///     - verify validator withdrawal credentials
//         ///     - set / change the pod proof submitter
//         ///     - recover lost ERC20 in the pod contract
//         address eigenPodManager;
//     }

//     /// @notice Init struct for the Symbiotic parameters (used for the Sym Byz Vaults)
//     struct SymParams {
//         /// @notice See BurnerParams struct
//         BurnerParams burnerParams;
//         /// @notice See VaultParams struct
//         VaultParams vaultParams;
//         /// @notice See DelegatorParams struct
//         DelegatorParams delegatorParams;
//         /// @notice See SlasherParams struct
//         SlasherParams slasherParams;
//     }

//     /// @notice Init struct for the Symbiotic BurnerRouter (used for Sym Byz Vaults)
//     struct BurnerParams {
//         /// @notice Owner of the BurnerRouter. Can change the receivers and the delay.
//         /// @dev Must be a trusted address or address(0) to make the BurnerRouter immutable
//         address owner;
//         /// @notice Delay between which new BurnerRouter settings are applied.
//         /// @dev Stakers can withdraw before new settings are applied if they don't agree the changes
//         uint48 delay;
//         /// @notice Global Receiver of the BurnerRouter. Usually the Burner contract.
//         /// @dev Is the route if no `operatorNetworkReceivers` or `networkReceivers` set (3rd priority)
//         address globalReceiver;
//         /// @notice Network receivers of the BurnerRouter. Set a receiver if a specific network is slashed.
//         /// @dev Is the route if no `operatorNetworkReceivers` set (2nd priority)
//         IBurnerRouter.NetworkReceiver[] networkReceivers;
//         /// @notice Operator network receivers of the BurnerRouter. Set a receiver if a specific operator of a specific network is slashed.
//         /// @dev Is the priority route. If set, it will be used instead of the other receivers (1st priority)
//         IBurnerRouter.OperatorNetworkReceiver[] operatorNetworkReceivers;
//     }

//     /// @notice Init struct for the Symbiotic Vault (used for Sym Byz Vaults)
//     struct VaultParams {
//         /// @notice Owner of the Vault (only have the right to migrate the Vault to new versions).
//         address owner;
//         /// @notice Implementation version of the Vault to deploy.
//         /// @dev Only vault's owner can migrate the Vault to new versions in the future.
//         uint64 version;
//         /// @notice Duration of the Vault epoch in seconds
//         uint48 epochDuration;
//     }

//     /// @notice Init struct for the Symbiotic Delegator (used for Sym Byz Vaults)
//     /// @dev Depending on the DelegatorType, some of these fields can be unused
//     struct DelegatorParams {
//         /// @notice Type of the Delegator to deploy (see DelegatorType enum)
//         DelegatorType delegatorType;
//         /// @notice Address of the hook (if not zero, receives onSlash() call on each slashing)
//         /// @dev Can be used to adjust delegations after a slashing event
//         /// @dev /!\ If not zero, the hook has to be appended to `networkLimitSetRoleHolders` and `operatorNetworkLimitOrSharesSetRoleHolders`
//         /// See https://docs.symbiotic.fi/modules/extensions/hooks#example-hooks for more details
//         address hook;
//         /// @notice Address of the role holder that can set the hook
//         /// @dev When the hook is changed, the new hook address has to be appended to `networkLimitSetRoleHolders` and `operatorNetworkLimitOrSharesSetRoleHolders`
//         address hookSetRoleHolder;
//         /// @notice Addresses of the role holders that can set the network limit (can be empty if OPERATOR_NETWORK_SPECIFIC Delegator chosen)
//         /// @dev networkLimit can be set only once networks have opted-in for the Vault (set a maxNetworkLimit)
//         /// @dev The role holders can change the networks delegation strategy at any time
//         /// @dev Used in NETWORK_RESTAKE, FULL_RESTAKE and OPERATOR_SPECIFIC Delegators
//         address[] networkLimitSetRoleHolders;
//         /// @notice Addresses of the role holders that can set the operator network shares or limit (can be empty if OPERATOR_SPECIFIC or OPERATOR_NETWORK_SPECIFICDelegator chosen)
//         /// @dev operatorNetworkShares can be set from the creation of the NetworkRestakeDelegator (therefore role is also given to the ByzVault)
//         /// @dev operatorNetworkLimit can be set from the creation of the FullRestakeDelegator (therefore role is also given to the ByzVault)
//         /// @dev The role holders can change the operator network delegation strategy at any time
//         /// @dev For the operator network stake to be accounted by the networks, operators have to be opted-in for the networks AND the vault.
//         /// @dev Used in NETWORK_RESTAKE (shares) and FULL_RESTAKE (limit) Delegators
//         address[] operatorNetworkLimitOrSharesSetRoleHolders;
//         /// @notice Address of the operator to delegate to (can be set to address(0) if Delegator Type 0 or 1 chosen)
//         /// @dev operator has to be registered in the Symbiotic Operator Registry
//         /// @dev once set, the operator cannot be changed
//         /// @dev Used in OPERATOR_SPECIFIC and OPERATOR_NETWORK_SPECIFIC Delegators
//         address operator;
//         /// @notice Address of the network to delegate to (can be set to address(0) if Delegator Type 0, 1 or 2 chosen)
//         /// @dev network has to be registered in the Symbiotic Network Registry. Not necessary to have the network opted-in for the vault.
//         /// @dev once set, the network cannot be changed
//         /// @dev Used in OPERATOR_NETWORK_SPECIFIC Delegator
//         address network;
//     }

//     /// @notice Init struct for the Symbiotic Slasher (used for Sym Byz Vaults)
//     struct SlasherParams {
//         /// @notice Type of the Slasher to deploy (see SlasherType enum)
//         SlasherType slasherType;
//         /// @notice Duration of the veto period for a slash request
//         /// @dev Cannot be changed once set
//         /// @dev Only used in VETO Slasher
//         uint48 vetoDuration;
//         /// @notice Delay in vault's epochs for a network to update a resolver
//         /// @dev Cannot be changed once set
//         /// @dev Only used in VETO Slasher
//         uint256 resolverSetEpochsDelay;
//     }

//     /* ============== EXTERNAL FUNCTIONS ============== */

//     /**
//      * @notice Creates a EigenByzVault with an ERC20 deposit token
//      * @param _byzVaultParams The parameters needed for an ERC20 ByzVault (see ByzVaultParams struct)
//      * @param _eigenParams The EigenLayer parameters (see EigenParams struct)
//      * @return eigenByzVault address of the newly created EigenByzVault.
//      */
//     function createEigenByzVault(
//         ByzVaultParams calldata _byzVaultParams,
//         EigenParams calldata _eigenParams
//     ) external returns (address eigenByzVault);

//     /**
//      * @notice Creates a EigenByzVault with native ETH as deposit token
//      * @param _nativeByzVaultParams The parameters needed for a Native ByzVault (see NativeByzVaultParams struct)
//      * @param _eigenParams The EigenLayer parameters (see EigenParams struct)
//      * @param _eigenPodParams The EigenPod parameters (see EigenPodParams struct)
//      * @return eigenByzVault address of the newly created EigenByzVault.
//      */
//     function createEigenByzVault(
//         NativeByzVaultParams calldata _nativeByzVaultParams,
//         EigenParams calldata _eigenParams,
//         EigenPodParams calldata _eigenPodParams
//     ) external returns (address eigenByzVault);

//     /**
//      * @notice Creates a SymByzVault with an ERC20 deposit token
//      * @param _byzVaultParams The parameters needed for an ERC20 ByzVault (see ByzVaultParams struct)
//      * @param _symParams The parameters for the Symbiotic Vault Module (see SymParams struct)
//      * @return symByzVault address of the newly created SymByzVault.
//      */
//     function createSymByzVault(
//         ByzVaultParams calldata _byzVaultParams,
//         SymParams calldata _symParams
//     ) external returns (address symByzVault);

//     /**
//      * @notice Creates a SymByzVault with native ETH as deposit token
//      * @param _nativeByzVaultParams The parameters needed for a Native ByzVault (see NativeByzVaultParams struct)
//      * @param _symParams The parameters for the Symbiotic Vault Module (see SymParams struct)
//      * @return symByzVault address of the newly created SymByzVault.
//      */
//     function createSymByzVault(
//         NativeByzVaultParams calldata _nativeByzVaultParams,
//         SymParams calldata _symParams
//     ) external returns (address symByzVault);

//     /**
//      * @notice Creates a SuperERC20Vault with an ERC20 deposit token
//      * @param _params Complete parameters for SuperERC20Vault initialization
//      * @return superVault address of the newly created SuperERC20Vault.
//      */
//     function createSuperERC20Vault(
//         ISuperERC20Vault.SuperVaultParams calldata _params
//     ) external returns (address superVault);

//     /* ============== OWNER FUNCTIONS ============== */

//     /**
//      * @notice Set the mapping between an ERC20 token and its associated EigenLayer Strategy.
//      * @param _token The array of ERC20 tokens addresses to map to a strategy.
//      * @param _strategy The array of EigenLayer Strategies addresses associated to the ERC20 tokens.
//      * @dev Factory's owner will call this mapping for the tokens accepted on EigenLayer but not in the StrategyFactory.deployedStrategies mapping.
//      * @dev The lengths of the `token` and `strategy` arrays must be the same.
//      * @dev Callable only by the the Factory's owner.
//      */
//     function setTokenToEigenStrategy(IERC20[] calldata _token, IStrategy[] calldata _strategy) external;

//     /* ============== VIEW FUNCTIONS ============== */

//     /**
//      * @notice Pre-calculates the address of a ByzVault and returns it
//      * @param _creator The address of the creator of the vault
//      * @param _vaultType The type of vault
//      * @param _version The version of implementation used for the deployment of the vault
//      * @return The address of the ByzVault (type: `_vaultType`, version: `_version`) if deployed by `_creator`
//      */
//     function preCalculateByzVaultAddress(
//         address _creator,
//         IVaultVersionControl.VaultType _vaultType,
//         uint64 _version
//     ) external view returns (address);

//     /* ============== ERRORS ============== */

//     /// @dev Returned when trying to create an Eigen Native Byz Vault with a non-ETH token
//     error InvalidETHAddress();

//     /// @dev Returned when input arrays lengths mismatch
//     error ArrayLengthMismatch();

//     /// @dev Returned when trying to create an Eigen Vault with a Strategy that doesn't exist
//     error EigenStrategyDoesNotExist();

//     /// @dev Returned if Eigen StategyManager doesn't allow deposits for the Strategy
//     error EigenStrategyNotWhitelisted();

//     /// @dev Returned when an invalid DelegatorType is used
//     error InvalidDelegatorType();

//     /// @dev Returned when an invalid SlasherType is used
//     error InvalidSlasherType();
// }
