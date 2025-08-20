import * as XLSX from "xlsx";

export interface ExcelAccountData {
  name: string;
  category: string;
  subtype: string;
  balance: number;
  balanceType: string;
  rowNumber: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ParsedExcelResult {
  data: ExcelAccountData[];
  errors: ValidationError[];
  totalRows: number;
  validRows: number;
}

export class ExcelParserService {
  // Valid account types
  private static readonly VALID_ACCOUNT_TYPES = [
    "asset",
    "liability",
    "equity",
    "income",
    "expense",
  ];

  // Valid balance types
  private static readonly VALID_BALANCE_TYPES = ["debit", "credit"];

  // Valid account groups with mappings
  private static readonly VALID_ACCOUNT_GROUPS = [
    "bank",
    "cash",
    "accounts_receivable",
    "fixed_asset",
    "inventory",
    "other_asset",
    "current_asset",
    "investment",
    "loans",
    "advances",
    "prepaid_expenses",
    "accounts_payable",
    "credit_card",
    "current_liability",
    "long_term_liability",
    "non_current_liability",
    "provisions",
    "loans_payable",
    "bonds_payable",
    "owner_equity",
    "retained_earnings",
    "capital",
    "drawings",
    "sales",
    "service_revenue",
    "other_income",
    "direct_income",
    "indirect_income",
    "interest_income",
    "commission_income",
    "cost_of_goods_sold",
    "operating_expense",
    "other_expense",
    "direct_expense",
    "indirect_expense",
    "salary_expense",
    "rent_expense",
    "utilities_expense",
    "advertising_expense",
    "depreciation_expense",
    "interest_expense",
    "tax_expense",
  ];

  // Common variations mapping
  private static readonly ACCOUNT_GROUP_MAPPINGS: Record<string, string> = {
    "non-current_liability": "long_term_liability",
    non_current_liability: "long_term_liability",
    noncurrent_liability: "long_term_liability",
    longterm_liability: "long_term_liability",
    long_term_liabilities: "long_term_liability",
    current_liabilities: "current_liability",
    accounts_receivables: "accounts_receivable",
    accounts_payables: "accounts_payable",
    fixed_assets: "fixed_asset",
    other_assets: "other_asset",
    current_assets: "current_asset",
    prepaid_expense: "prepaid_expenses",
    cost_of_goods: "cost_of_goods_sold",
    cogs: "cost_of_goods_sold",
    operating_expenses: "operating_expense",
    other_expenses: "other_expense",
    direct_expenses: "direct_expense",
    indirect_expenses: "indirect_expense",
    salary_expenses: "salary_expense",
    rent_expenses: "rent_expense",
    utilities_expenses: "utilities_expense",
    advertising_expenses: "advertising_expense",
    depreciation_expenses: "depreciation_expense",
    interest_expenses: "interest_expense",
    tax_expenses: "tax_expense",
  };

  /**
   * Parse Excel file and return structured data
   */
  static async parseExcelFile(file: File): Promise<ParsedExcelResult> {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      return this.parseRows(jsonData);
    } catch (error) {
      throw new Error(
        `Failed to parse Excel file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Parse rows from Excel data
   */
  static parseRows(rows: any[]): ParsedExcelResult {
    const data: ExcelAccountData[] = [];
    const errors: ValidationError[] = [];

    // Skip header row
    const dataRows = rows.slice(1);
    let validRows = 0;

    dataRows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because we skip header and arrays are 0-indexed

      // Skip empty rows
      if (!row[0] && !row[1] && !row[2]) {
        return;
      }

      const accountData: ExcelAccountData = {
        name: row[0]?.toString().trim() || "",
        category: row[1]?.toString().trim() || "",
        subtype: row[2]?.toString().trim() || "",
        balance: parseFloat(row[3]) || 0,
        balanceType: row[4]?.toString().toLowerCase() || "debit",
        rowNumber,
      };

      // Validate the row
      const rowErrors = this.validateRow(accountData);

      if (rowErrors.length === 0) {
        // Map subtype to valid format
        accountData.subtype = this.mapAccountGroup(accountData.subtype);
        data.push(accountData);
        validRows++;
      } else {
        errors.push(...rowErrors);
      }
    });

    return {
      data,
      errors,
      totalRows: dataRows.length,
      validRows,
    };
  }

  /**
   * Validate a single row of data
   */
  private static validateRow(data: ExcelAccountData): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate account name
    if (!data.name.trim()) {
      errors.push({
        row: data.rowNumber,
        field: "Account Name",
        message: "Account name is required",
      });
    }

    // Validate category - more flexible validation
    if (!data.category.trim()) {
      errors.push({
        row: data.rowNumber,
        field: "Account Head",
        message: "Account head is required",
      });
    } else if (data.category.trim().length > 50) {
      errors.push({
        row: data.rowNumber,
        field: "Account Head",
        message: "Account head is too long (max 50 characters)",
      });
    }

    // Validate subtype - more flexible validation
    if (!data.subtype.trim()) {
      errors.push({
        row: data.rowNumber,
        field: "Account Group",
        message: "Account group is required",
      });
    } else if (data.subtype.trim().length > 100) {
      errors.push({
        row: data.rowNumber,
        field: "Account Group",
        message: "Account group is too long (max 100 characters)",
      });
    }

    // Validate balance
    if (isNaN(data.balance)) {
      errors.push({
        row: data.rowNumber,
        field: "Balance",
        message: "Balance must be a valid number",
      });
    }

    // Validate balance type
    if (!this.VALID_BALANCE_TYPES.includes(data.balanceType)) {
      errors.push({
        row: data.rowNumber,
        field: "Balance Type",
        message: `Invalid balance type. Must be one of: ${this.VALID_BALANCE_TYPES.join(
          ", "
        )}`,
      });
    }

    return errors;
  }

  /**
   * Map account group to valid subtype
   */
  static mapAccountGroup(accountGroup: string): string {
    const normalized = accountGroup.toLowerCase().replace(/\s+/g, "_");
    return this.ACCOUNT_GROUP_MAPPINGS[normalized] || normalized;
  }

  /**
   * Get validation summary
   */
  static getValidationSummary(result: ParsedExcelResult): string {
    const { totalRows, validRows, errors } = result;

    if (errors.length === 0) {
      return `All ${validRows} rows are valid and ready for import.`;
    }

    return `${validRows} valid rows, ${errors.length} errors found. Please fix the errors before importing.`;
  }

  /**
   * Format errors for display
   */
  static formatErrors(errors: ValidationError[]): string {
    return errors
      .map((error) => `Row ${error.row}: ${error.field} - ${error.message}`)
      .join("\n");
  }
}
