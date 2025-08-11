/**
 * Utility functions for generating unique delivery challan IDs
 */

export interface ChallanIdConfig {
  prefix: string;
  year: number;
  sequence: number;
  separator?: string;
}

export interface ChallanIdResult {
  challanId: string;
  displayId: string;
  config: ChallanIdConfig;
}

/**
 * Generate a unique challan ID based on configuration
 * @param config - Configuration for the challan ID
 * @returns Generated challan ID and display format
 */
export function generateChallanId(config: ChallanIdConfig): ChallanIdResult {
  const { prefix, year, sequence, separator = '-' } = config;
  
  // Format: DC-2024-0001
  const formattedYear = year.toString();
  const formattedSequence = sequence.toString().padStart(4, '0');
  
  const challanId = `${prefix}${separator}${formattedYear}${separator}${formattedSequence}`;
  const displayId = `${prefix}${separator}${formattedYear}${separator}${formattedSequence}`;
  
  return {
    challanId,
    displayId,
    config
  };
}

/**
 * Parse an existing challan ID to extract its components
 * @param challanId - The challan ID to parse
 * @param separator - Separator used in the ID
 * @returns Parsed challan ID components
 */
export function parseChallanId(challanId: string, separator: string = '-'): ChallanIdConfig | null {
  try {
    const parts = challanId.split(separator);
    
    if (parts.length !== 3) {
      return null;
    }
    
    const [prefix, yearStr, sequenceStr] = parts;
    const year = parseInt(yearStr, 10);
    const sequence = parseInt(sequenceStr, 10);
    
    if (isNaN(year) || isNaN(sequence)) {
      return null;
    }
    
    return {
      prefix,
      year,
      sequence,
      separator
    };
  } catch (error) {
    console.error('Error parsing challan ID:', error);
    return null;
  }
}

/**
 * Generate the next challan ID based on the last one
 * @param lastChallanId - The last challan ID used
 * @param separator - Separator used in the ID
 * @returns Next challan ID configuration
 */
export function getNextChallanId(lastChallanId: string, separator: string = '-'): ChallanIdConfig | null {
  const parsed = parseChallanId(lastChallanId, separator);
  
  if (!parsed) {
    return null;
  }
  
  const currentYear = new Date().getFullYear();
  
  // If it's a new year, reset sequence to 1
  if (parsed.year !== currentYear) {
    return {
      prefix: parsed.prefix,
      year: currentYear,
      sequence: 1,
      separator
    };
  }
  
  // Otherwise, increment the sequence
  return {
    ...parsed,
    sequence: parsed.sequence + 1
  };
}

/**
 * Generate a challan ID for the current year
 * @param prefix - Prefix for the challan (e.g., 'DC' for Delivery Challan)
 * @param currentSequence - Current sequence number
 * @returns Generated challan ID
 */
export function generateCurrentYearChallanId(prefix: string, currentSequence: number): ChallanIdResult {
  const currentYear = new Date().getFullYear();
  
  return generateChallanId({
    prefix,
    year: currentYear,
    sequence: currentSequence
  });
}

/**
 * Validate if a challan ID follows the expected format
 * @param challanId - The challan ID to validate
 * @param expectedPrefix - Expected prefix
 * @param separator - Expected separator
 * @returns Whether the challan ID is valid
 */
export function validateChallanId(
  challanId: string, 
  expectedPrefix: string, 
  separator: string = '-'
): boolean {
  const parsed = parseChallanId(challanId, separator);
  
  if (!parsed) {
    return false;
  }
  
  // Check if prefix matches
  if (parsed.prefix !== expectedPrefix) {
    return false;
  }
  
  // Check if year is reasonable (between 2020 and 2030)
  if (parsed.year < 2020 || parsed.year > 2030) {
    return false;
  }
  
  // Check if sequence is positive
  if (parsed.sequence <= 0) {
    return false;
  }
  
  return true;
}

/**
 * Format a challan ID for display with proper spacing and styling
 * @param challanId - The challan ID to format
 * @param separator - Separator used in the ID
 * @returns Formatted challan ID for display
 */
export function formatChallanIdForDisplay(challanId: string, separator: string = '-'): string {
  const parsed = parseChallanId(challanId, separator);
  
  if (!parsed) {
    return challanId; // Return as-is if parsing fails
  }
  
  // Format: DC - 2024 - 0001
  return `${parsed.prefix} ${separator} ${parsed.year} ${separator} ${parsed.sequence.toString().padStart(4, '0')}`;
}
