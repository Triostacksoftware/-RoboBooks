/**
 * Credit Note ID Generator
 * Generates unique credit note numbers in the format CN-XXXXX
 */

export class CreditNoteIdGenerator {
  private static instance: CreditNoteIdGenerator;
  private currentNumber: number = 0;

  private constructor() {}

  public static getInstance(): CreditNoteIdGenerator {
    if (!CreditNoteIdGenerator.instance) {
      CreditNoteIdGenerator.instance = new CreditNoteIdGenerator();
    }
    return CreditNoteIdGenerator.instance;
  }

  /**
   * Generate the next credit note number
   * @param lastCreditNoteNumber - The last credit note number to increment from
   * @returns The next credit note number
   */
  public generateNextNumber(lastCreditNoteNumber?: string): string {
    let nextNumber = 1;

    if (lastCreditNoteNumber) {
      // Extract the number part from the last credit note number
      const match = lastCreditNoteNumber.match(/CN-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    } else {
      // If no last number provided, start from 1
      nextNumber = 1;
    }

    // Format the number with leading zeros (5 digits)
    const formattedNumber = nextNumber.toString().padStart(5, '0');
    return `CN-${formattedNumber}`;
  }

  /**
   * Parse a credit note number to get the numeric part
   * @param creditNoteNumber - The credit note number to parse
   * @returns The numeric part of the credit note number
   */
  public parseNumber(creditNoteNumber: string): number {
    const match = creditNoteNumber.match(/CN-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Validate if a credit note number is in the correct format
   * @param creditNoteNumber - The credit note number to validate
   * @returns True if the format is valid
   */
  public isValidFormat(creditNoteNumber: string): boolean {
    return /^CN-\d{5}$/.test(creditNoteNumber);
  }

  /**
   * Get the next number based on existing credit notes
   * @param existingCreditNotes - Array of existing credit note numbers
   * @returns The next credit note number
   */
  public getNextFromExisting(existingCreditNotes: string[]): string {
    if (existingCreditNotes.length === 0) {
      return this.generateNextNumber();
    }

    // Find the highest number
    const numbers = existingCreditNotes
      .map(cn => this.parseNumber(cn))
      .filter(num => num > 0);

    if (numbers.length === 0) {
      return this.generateNextNumber();
    }

    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;
    const formattedNumber = nextNumber.toString().padStart(5, '0');
    return `CN-${formattedNumber}`;
  }
}

// Export a singleton instance
export const creditNoteIdGenerator = CreditNoteIdGenerator.getInstance();

// Example usage:
// const nextNumber = creditNoteIdGenerator.generateNextNumber('CN-00001'); // Returns 'CN-00002'
// const nextNumber = creditNoteIdGenerator.getNextFromExisting(['CN-00001', 'CN-00003']); // Returns 'CN-00004'
