// @ts-check

// Get the metadata of the vault // metadata()

// Change the metadata of the vault // updateMetadataURI (string metadataURI), use pinata to store the metadata

import { ethers } from "ethers";
import { Metadata } from "../../types";
import { callContractMethod, executeContractMethod } from "../../utils";

// Validation patterns for metadata and URIs
export const METADATA_VALIDATION = {
  // Regular expression to validate URLs
  URL_PATTERN: /^(https?):\/\/[^\s/$.?#].[^\s]*$/,
  // Regular expression to validate IPFS URIs
  IPFS_URI_PATTERN: /^ipfs:\/\/[a-zA-Z0-9]{46}$/,
  // Regular expression to validate base64 data URIs
  DATA_URI_PATTERN: /^data:application\/json;base64,[a-zA-Z0-9+/=]+$/,
  // Supported image extensions
  IMAGE_EXTENSIONS: [".png", ".jpg", ".jpeg"],
  // Maximum metadata size in bytes (1MB)
  MAX_METADATA_SIZE: 1048576,
  // Maximum length for text fields
  MAX_NAME_LENGTH: 100,
  // Maximum length for text fields
  MAX_DESCRIPTION_LENGTH: 5000,
  // Regular expression for Ethereum addresses
  ETH_ADDRESS_PATTERN: /^0x[0-9a-fA-F]{40}$/,
  // Social media URL validation patterns
  SOCIAL_TWITTER_PATTERN:
    /^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com\/|x\.com\/)([a-zA-Z0-9_]{1,15})(?:\/)?$/,
  SOCIAL_DISCORD_PATTERN:
    /^(?:https?:\/\/)?(?:www\.)?(?:discord\.gg\/|discord\.com\/invite\/)([a-zA-Z0-9-]+)(?:\/)?$/,
  SOCIAL_TELEGRAM_PATTERN:
    /^(?:https?:\/\/)?(?:www\.)?(?:t\.me\/|telegram\.me\/)([a-zA-Z0-9_]{5,32})(?:\/)?$/,
  SOCIAL_GITHUB_PATTERN:
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)(?:\/)?$/,
};

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
 * Validates metadata object structure and content
 * @param metadata - The metadata object to validate
 * @throws Error if validation fails
 */
const validateMetadata = (metadata: Metadata): void => {
  // Check required fields
  if (!metadata.name) {
    throw Error("Metadata must include a 'name' field");
  }

  if (!metadata.description) {
    throw Error("Metadata must include a 'description' field");
  }

  // Validate field lengths
  if (metadata.name.length > METADATA_VALIDATION.MAX_NAME_LENGTH) {
    throw Error(
      `Name exceeds maximum length of ${METADATA_VALIDATION.MAX_NAME_LENGTH} characters`
    );
  }

  if (
    metadata.description.length > METADATA_VALIDATION.MAX_DESCRIPTION_LENGTH
  ) {
    throw Error(
      `Description exceeds maximum length of ${METADATA_VALIDATION.MAX_DESCRIPTION_LENGTH} characters`
    );
  }

  // Validate image URL if present
  if (metadata.image_url) {
    const isValidUrl =
      METADATA_VALIDATION.URL_PATTERN.test(metadata.image_url) ||
      metadata.image_url.startsWith("ipfs://") ||
      metadata.image_url.startsWith("data:image/") ||
      /^https?:\/\/raw\.githubusercontent\.com\//.test(metadata.image_url);
    if (!isValidUrl) {
      throw Error(
        "Image URL must be a valid HTTP/HTTPS URL, IPFS URI, data URI, or a raw.githubusercontent.com URL"
      );
    }

    // If it's a regular URL, validate the file extension
    if (
      METADATA_VALIDATION.URL_PATTERN.test(metadata.image_url) ||
      /^https?:\/\/raw\.githubusercontent\.com\//.test(metadata.image_url)
    ) {
      const hasValidExtension = METADATA_VALIDATION.IMAGE_EXTENSIONS.some(
        (ext) => metadata.image_url!.toLowerCase().endsWith(ext)
      );
      if (!hasValidExtension) {
        throw Error(
          `Image URL must end with one of the following extensions: ${METADATA_VALIDATION.IMAGE_EXTENSIONS.join(
            ", "
          )}`
        );
      }
    }
  }

  // Validate social media URLs if present
  if (
    metadata.social_twitter &&
    !METADATA_VALIDATION.SOCIAL_TWITTER_PATTERN.test(metadata.social_twitter)
  ) {
    throw Error("Twitter URL must be a valid Twitter URL format");
  }

  if (
    metadata.social_discord &&
    !METADATA_VALIDATION.URL_PATTERN.test(metadata.social_discord)
  ) {
    throw Error("Discord URL must be a valid URL");
  }

  if (
    metadata.social_telegram &&
    !METADATA_VALIDATION.SOCIAL_TELEGRAM_PATTERN.test(metadata.social_telegram)
  ) {
    throw Error("Telegram URL must be a valid Telegram URL format");
  }

  if (
    metadata.social_website &&
    !METADATA_VALIDATION.URL_PATTERN.test(metadata.social_website)
  ) {
    throw Error("Website URL must be a valid HTTP/HTTPS URL");
  }

  if (
    metadata.social_github &&
    !METADATA_VALIDATION.SOCIAL_GITHUB_PATTERN.test(metadata.social_github)
  ) {
    throw Error("GitHub URL must be a valid GitHub URL format");
  }

  // Check overall metadata size
  const metadataSize = new TextEncoder().encode(
    JSON.stringify(metadata)
  ).length;
  if (metadataSize > METADATA_VALIDATION.MAX_METADATA_SIZE) {
    throw Error(
      `Metadata size exceeds maximum of ${METADATA_VALIDATION.MAX_METADATA_SIZE} bytes`
    );
  }
};

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
  // Validate metadata using the comprehensive validation function
  validateMetadata(metadata);

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

      // Validate IPFS hash format
      if (!ipfsHash || typeof ipfsHash !== "string" || ipfsHash.length !== 46) {
        throw Error("Invalid IPFS hash returned from Pinata");
      }

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
  const dataUri = `data:application/json;base64,${base64Metadata}`;

  // Validate the data URI
  if (!METADATA_VALIDATION.DATA_URI_PATTERN.test(dataUri)) {
    throw Error("Failed to generate valid data URI");
  }

  return dataUri;
};

/**
 * Validates a URI string
 * @param uri - The URI to validate
 * @throws Error if validation fails
 */
const validateURI = (uri: string): void => {
  if (!uri) {
    throw Error("URI is required");
  }

  // Check for data URI format
  if (uri.startsWith("data:application/json;base64,")) {
    if (!METADATA_VALIDATION.DATA_URI_PATTERN.test(uri)) {
      throw Error("Invalid data URI format");
    }
    return;
  }

  // Check for IPFS URI format
  if (uri.startsWith("ipfs://")) {
    const ipfsHash = uri.substring("ipfs://".length);
    if (ipfsHash.length !== 46) {
      throw Error("Invalid IPFS hash length in URI");
    }
    return;
  }

  // Check for HTTP/HTTPS URL format
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    if (!METADATA_VALIDATION.URL_PATTERN.test(uri)) {
      throw Error("Invalid HTTP/HTTPS URL format");
    }
    return;
  }

  throw Error(`Unsupported URI format: ${uri.substring(0, 20)}...`);
};

/**
 * Convert URI back to Metadata object
 * Supports both IPFS URIs and data URIs
 *
 * @param uri - The URI to convert (ipfs:// or data:application/json;base64,)
 * @returns The metadata object
 */
export const convertURItoMetadata = async (uri: string): Promise<Metadata> => {
  // Validate URI format
  validateURI(uri);

  try {
    // Handle data URIs
    if (uri.startsWith("data:application/json;base64,")) {
      // Extract the base64 encoded data
      const base64Data = uri.substring("data:application/json;base64,".length);
      // Decode base64 to JSON string
      const jsonString = Buffer.from(base64Data, "base64").toString("utf-8");

      try {
        // Parse JSON to object
        const metadata = JSON.parse(jsonString) as Metadata;
        // Validate the parsed metadata
        validateMetadata(metadata);
        return metadata;
      } catch (parseError) {
        throw Error("Invalid JSON format in data URI");
      }
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

      // Validate gateway URL
      if (
        !METADATA_VALIDATION.URL_PATTERN.test(
          gateway.replace(/\/$/, "") + "/test"
        )
      ) {
        throw Error("Invalid IPFS gateway URL");
      }

      // Fetch metadata from IPFS using public gateway
      const url = `${gateway}${ipfsHash}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw Error(`IPFS fetch failed: ${response.statusText}`);
      }

      try {
        // Parse JSON response
        const metadata = (await response.json()) as Metadata;
        // Validate the fetched metadata
        validateMetadata(metadata);
        return metadata;
      } catch (parseError) {
        throw Error("Invalid JSON format in IPFS response");
      }
    }

    // Handle HTTP/HTTPS URIs
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      const response = await fetch(uri);

      if (!response.ok) {
        throw Error(`HTTP fetch failed: ${response.statusText}`);
      }

      try {
        // Parse JSON response
        const metadata = (await response.json()) as Metadata;
        // Validate the fetched metadata
        validateMetadata(metadata);
        return metadata;
      } catch (parseError) {
        throw Error("Invalid JSON format in HTTP response");
      }
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
      // Validate the URI
      validateURI(metadata);
      metadataURI = metadata;
    } else {
      metadataURI = await convertMetadataToURI(metadata);
    }

    console.log(`Using URI: ${metadataURI}`);

    // Update the vault's metadata URI
    return await executeContractMethod(
      vaultContract,
      "updateMetadataURI",
      metadataURI
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
