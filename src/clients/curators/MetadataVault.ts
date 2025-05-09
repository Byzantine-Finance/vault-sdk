// @ts-check

// Get the metadata of the vault // metadata()

// Change the metadata of the vault // updateMetadataURI (string metadataURI), use pinata to store the metadata

import { ethers } from "ethers";
import { GAS_LIMITS } from "../../constants";
import { Metadata } from "../../types";
import { callContractMethod, executeContractMethod } from "../../utils";

/**
 * Get the metadata URI of the vault
 * @param vaultContract - The vault contract instance
 * @returns The metadata URI string
 */
export async function getVaultMetadata(
  vaultContract: ethers.Contract
): Promise<Metadata> {
  // The contract may not have a direct method to get the metadata URI
  // We need to check the specific implementation
  if (typeof vaultContract.metadataURI === "function") {
    const metadataURI = await callContractMethod<string>(
      vaultContract,
      "metadataURI"
    );
    return await callContractMethod<Metadata>(
      vaultContract,
      "metadata",
      metadataURI
    );
  } else {
    throw Error("This vault does not support direct metadataURI access");
  }
}

/**
 * Convert Metadata object to URI using Pinata IPFS service
 * This function tries to upload metadata to IPFS via Pinata API
 * If Pinata fails, it falls back to a data URI
 *
 * @param metadata - The metadata object to convert
 * @returns An IPFS URI or data URI representing the metadata
 */
export const convertMetadataToURI = async (
  metadata: Metadata
): Promise<string> => {
  // Validate required metadata fields
  if (!metadata.name) {
    throw Error("Metadata must include a 'name' field");
  }

  if (!metadata.description) {
    throw Error("Metadata must include a 'description' field");
  }

  // Check for Pinata API keys in environment variables
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

  if (!pinataApiKey || !pinataSecretApiKey) {
    throw Error(
      "Missing required Pinata API credentials: PINATA_API_KEY and PINATA_SECRET_API_KEY environment variables must be configured"
    );
  }

  // Try to use Pinata if API keys are available
  if (pinataApiKey && pinataSecretApiKey) {
    try {
      // Prepare headers for Pinata API request
      const headers = {
        "Content-Type": "application/json",
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      };

      // Upload metadata to Pinata using fetch
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(metadata),
        }
      );

      // Check if upload was successful
      if (!response.ok) {
        // Simple error with no stack trace
        throw Error(`Pinata: ${response.statusText}`);
      }

      // Parse the response to get the IPFS hash
      const data = await response.json();
      const ipfsHash = data.IpfsHash;

      // Return IPFS URI using the hash returned by Pinata
      return `ipfs://${ipfsHash}`;
    } catch (pinataError) {
      // Fallback silently to data URI without detailed error logs
      // Just a simple one-line log
      if (pinataError instanceof Error) {
        console.log(`Pinata fallback: ${pinataError.message}`);
      }
    }
  }

  // Fallback: Use data URI when Pinata is not available or failed
  // Convert metadata to data URI without verbose logging
  const metadataJSON = JSON.stringify(metadata);
  const base64Metadata = Buffer.from(metadataJSON).toString("base64");
  return `data:application/json;base64,${base64Metadata}`;
};

/**
 * Convert URI back to Metadata object
 * Supports both IPFS URIs and data URIs
 *
 * @param uri - The URI to convert (ipfs:// or data:application/json;base64,)
 * @returns The metadata object
 */
export const convertURItoMetadata = async (uri: string): Promise<Metadata> => {
  if (!uri) {
    throw Error("URI is required");
  }

  try {
    // Handle data URIs
    if (uri.startsWith("data:application/json;base64,")) {
      // Extract the base64 encoded data
      const base64Data = uri.substring("data:application/json;base64,".length);
      // Decode base64 to JSON string
      const jsonString = Buffer.from(base64Data, "base64").toString("utf-8");
      // Parse JSON to object
      return JSON.parse(jsonString) as Metadata;
    }

    // Handle IPFS URIs (ipfs://...)
    if (uri.startsWith("ipfs://")) {
      const ipfsHash = uri.substring("ipfs://".length);

      // Determine which IPFS gateway to use - from env or default to public gateway
      let gateway = process.env.IPFS_GATEWAY || "https://ipfs.io/ipfs/";
      // Make sure gateway ends with /
      if (!gateway.endsWith("/")) {
        gateway += "/";
      }

      // Fetch metadata from IPFS using public gateway
      const url = `${gateway}${ipfsHash}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw Error(`IPFS fetch failed: ${response.statusText}`);
      }

      // Parse JSON response
      return (await response.json()) as Metadata;
    }

    // Handle HTTP/HTTPS URIs
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      const response = await fetch(uri);

      if (!response.ok) {
        throw Error(`HTTP fetch failed: ${response.statusText}`);
      }

      // Parse JSON response
      return (await response.json()) as Metadata;
    }

    throw Error(`Unsupported URI format: ${uri.substring(0, 20)}...`);
  } catch (error) {
    if (error instanceof Error) {
      throw Error(`Failed to convert URI to metadata: ${error.message}`);
    } else {
      throw Error("Unknown error converting URI to metadata");
    }
  }
};

/**
 * Update the metadata URI of the vault
 * @param vaultContract - The vault contract connected to signer
 * @param metadata - The metadata object to be stored or directly URI
 * @returns Transaction response
 */
export async function setMetadata(
  vaultContract: ethers.Contract,
  metadata: Metadata | string
): Promise<ethers.TransactionResponse> {
  if (!vaultContract) {
    throw Error("Vault contract is required");
  }

  try {
    // Convert metadata to URI (validation done inside convertMetadataToURI)
    let metadataURI;
    if (typeof metadata === "string") {
      metadataURI = metadata;
    } else {
      metadataURI = await convertMetadataToURI(metadata);
    }

    console.log(`Using URI: ${metadataURI}`);

    // Update the vault's metadata URI
    return await executeContractMethod(
      vaultContract,
      "updateMetadataURI",
      metadataURI,
      { gasLimit: GAS_LIMITS.setDepositLimit }
    );
  } catch (error) {
    // Re-throw the error with a clean message and no stack trace
    if (error instanceof Error) {
      throw Error(error.message);
    } else {
      throw Error("Unknown error updating metadata");
    }
  }
}
