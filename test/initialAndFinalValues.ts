// Set multiples values of the vaults so we can create them with those
// Then, we'll try to update then if possible first with one or more non-possible updates,
// then with one or more possible values. To finally put it back to the initial values.
// And between each change/non-change, read the value on-chain if possible

import {
  BaseParams,
  NativeParams,
  EigenlayerParams,
  EigenpodParams,
  SymbioticParams,
  DelegatorType,
  SlasherType,
} from "../src/types/index";

import { ETH_TOKEN_ADDRESS, getNetworkConfig } from "../dist/constants";
import { ethers } from "ethers";

const YOUR_ADDRESS = "0xe5b709A14859EdF820347D78E587b1634B0ec771";

const networkConfig = getNetworkConfig(17000);

const BASE_PARAMS: BaseParams = {
  name: "Eigen ERC20 Vault",
  description: "This is a basic Eigen ERC20 Vault",

  token_address: networkConfig.stETHAddress,

  is_deposit_limit: true,
  deposit_limit: ethers.parseEther("1000"), // Keep as string to avoid overflow

  is_private: false,

  is_tokenized: true,
  token_name: "Byzantine ETH Vault",
  token_symbol: "bETH",

  curator_fee: 300, // 3% (300 basis points)

  // Roles - replace with actual addresses in production
  role_manager: YOUR_ADDRESS,
  role_version_manager: YOUR_ADDRESS,
  role_deposit_limit_manager: YOUR_ADDRESS,
  role_deposit_whitelist_manager: YOUR_ADDRESS,
  role_curator_fee_claimer: YOUR_ADDRESS,
  role_curator_fee_claimer_admin: YOUR_ADDRESS,
};

const NATIVE_PARAMS: NativeParams = {
  byzVaultParams: {
    ...BASE_PARAMS,
    name: "Eigen Native Vault",
    description: "This is a basic Eigen Native Vault",
    token_address: ETH_TOKEN_ADDRESS,
    deposit_limit: ethers.parseEther("1000"),
    token_name: "Byzantine ETH Vault",
    token_symbol: "bETH",
    curator_fee: 500, // 5% (500 basis points)
  },

  operator_id: "0x0000000000000000000000000000000000000000", // So it's myself

  roles_validator_manager: [YOUR_ADDRESS],
};

const EIGEN_PARAMS: EigenlayerParams = {
  delegation_set_role_holder: YOUR_ADDRESS,
  operator: "0xb564e795f9877b416cd1af86c98cf8d3d94d760d", // Address of the operator that has the AVS

  approver_signature_and_expiry: {
    signature: "0x",
    expiry: 0,
  },
  approver_salt:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
};

const EIGENPOD_PARAMS: EigenpodParams = {
  eigen_pod_owner: YOUR_ADDRESS,
  proof_submitter: YOUR_ADDRESS,
};

const SYMBIOTIC_PARAMS: SymbioticParams = {
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

  role_delegator_set_hook: YOUR_ADDRESS,
  role_delegator_set_network_limit: [YOUR_ADDRESS],
  role_delegator_set_operator_network_limit: [YOUR_ADDRESS],
  role_burner_owner_burner: YOUR_ADDRESS,
};
