/**
 * Generate Error Mapping
 *
 * This script extracts error definitions from ABI files and generates
 * a mapping between error selector (first 4 bytes of error hash) and error names.
 */

import * as fs from "fs";
import * as path from "path";
import { ethers } from "ethers";

// Path to ABI files
const ABI_DIR = path.join(__dirname, "../src/constants");

// Function to get error hash selector (first 4 bytes)
function getErrorSelector(signature: string): string {
  const hash = ethers.keccak256(ethers.toUtf8Bytes(signature));
  return hash.substring(0, 10); // 0x + 8 characters (4 bytes)
}

// Manually process the file content to extract error definitions
function extractErrorsFromFile(
  filePath: string
): { name: string; signature: string }[] {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const errors: { name: string; signature: string }[] = [];

    // Use regex to find all error definitions
    const errorRegex =
      /{[\s\n]*type:[\s\n]*"error",[\s\n]*name:[\s\n]*"([^"]+)"[\s\S]*?}/g;
    let match;

    while ((match = errorRegex.exec(content)) !== null) {
      const errorName = match[1];
      const errorDef = match[0];

      // Extract inputs if they exist
      const inputsMatch = errorDef.match(/inputs:[\s\n]*\[([\s\S]*?)\]/);
      let inputTypes: string[] = [];

      if (inputsMatch && inputsMatch[1].trim()) {
        // Try to extract all input types
        const inputTypeRegex = /type:[\s\n]*"([^"]+)"/g;
        let typeMatch;

        while ((typeMatch = inputTypeRegex.exec(inputsMatch[1])) !== null) {
          inputTypes.push(typeMatch[1]);
        }
      }

      // Create the signature
      const signature = `${errorName}(${inputTypes.join(",")})`;
      errors.push({ name: errorName, signature });
    }

    return errors;
  } catch (error) {
    return [];
  }
}

async function generateErrorMapping() {
  console.log("Generating error code mapping...");

  const errorMap: Record<string, string> = {};
  const processedErrors = new Set<string>();

  // Read all TS files in the constants directory
  const files = fs
    .readdirSync(ABI_DIR)
    .filter((file) => file.endsWith("ABI.ts"));

  for (const file of files) {
    const filePath = path.join(ABI_DIR, file);

    // Utiliser directement l'extraction par regex
    const errors = extractErrorsFromFile(filePath);

    for (const error of errors) {
      // Ne traiter chaque erreur qu'une seule fois
      if (!processedErrors.has(error.name)) {
        processedErrors.add(error.name);

        const selector = getErrorSelector(error.signature);
        // Stocker avec les parenthèses pour indiquer qu'il s'agit d'une fonction
        errorMap[selector] = error.signature;
      }
    }
  }

  // Generate TypeScript file
  const outputPath = path.join(__dirname, "../src/utils/errorCodeMapping.ts");
  const fileContent = `/**
 * Error Code Mapping
 * 
 * This file is auto-generated during build process.
 * It contains a mapping between error selector (first 4 bytes of error hash) and error names.
 * Do not edit manually.
 */

export const ErrorCodeMapping: Record<string, string> = ${JSON.stringify(
    errorMap,
    null,
    2
  )};
`;

  fs.writeFileSync(outputPath, fileContent);
  console.log(`Error code mapping generated at ${outputPath}`);
}

// Run the script
generateErrorMapping().catch(() => {});
