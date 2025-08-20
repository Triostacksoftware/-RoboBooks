# Chart of Accounts Excel Upload Guide

This guide explains how to upload Chart of Accounts data via Excel file in RoboBooks.

## Excel File Format

Your Excel file should have the following columns in order:

| Column | Header        | Description             | Required | Example      |
| ------ | ------------- | ----------------------- | -------- | ------------ |
| A      | Account Name  | The name of the account | Yes      | "ICICI Bank" |
| B      | Account Head  | The main category       | Yes      | "Asset"      |
| C      | Account Group | The subcategory/subtype | Yes      | "Bank"       |
| D      | Balance       | Opening balance amount  | No       | 50000        |
| E      | Balance Type  | "debit" or "credit"     | No       | "debit"      |

## Valid Account Heads (Column B)

- **Asset** - For assets like cash, bank accounts, receivables
- **Liability** - For liabilities like payables, loans
- **Equity** - For owner's equity, capital, retained earnings
- **Income** - For revenue, sales, other income
- **Expense** - For expenses, costs, losses

## Valid Account Groups (Column C)

### Asset Account Groups

- `bank` - Bank accounts
- `cash` - Cash in hand
- `accounts_receivable` - Money owed by customers
- `fixed_asset` - Long-term assets
- `inventory` - Stock/inventory
- `other_asset` - Other assets
- `current_asset` - Current assets
- `investment` - Investments
- `loans` - Loans given to others
- `advances` - Advances given
- `prepaid_expenses` - Prepaid expenses

### Liability Account Groups

- `accounts_payable` - Money owed to suppliers
- `credit_card` - Credit card balances
- `current_liability` - Current liabilities
- `long_term_liability` - Long-term liabilities
- `non_current_liability` - Non-current liabilities (same as long_term_liability)
- `provisions` - Provisions
- `loans_payable` - Loans taken
- `bonds_payable` - Bonds issued

### Equity Account Groups

- `owner_equity` - Owner's equity
- `retained_earnings` - Retained earnings
- `capital` - Capital accounts
- `drawings` - Owner's drawings

### Income Account Groups

- `sales` - Sales revenue
- `service_revenue` - Service income
- `other_income` - Other income
- `direct_income` - Direct income
- `indirect_income` - Indirect income
- `interest_income` - Interest earned
- `commission_income` - Commission income

### Expense Account Groups

- `cost_of_goods_sold` - Cost of goods sold
- `operating_expense` - Operating expenses
- `other_expense` - Other expenses
- `direct_expense` - Direct expenses
- `indirect_expense` - Indirect expenses
- `salary_expense` - Salary expenses
- `rent_expense` - Rent expenses
- `utilities_expense` - Utility expenses
- `advertising_expense` - Advertising expenses
- `depreciation_expense` - Depreciation
- `interest_expense` - Interest expenses
- `tax_expense` - Tax expenses

## Sample Excel Data

Here's an example of how your Excel file should look:

| Account Name        | Account Head | Account Group       | Balance | Balance Type |
| ------------------- | ------------ | ------------------- | ------- | ------------ |
| ICICI Bank          | Asset        | bank                | 100000  | debit        |
| Cash in Hand        | Asset        | cash                | 50000   | debit        |
| Accounts Receivable | Asset        | accounts_receivable | 75000   | debit        |
| Office Equipment    | Asset        | fixed_asset         | 25000   | debit        |
| Inventory           | Asset        | inventory           | 150000  | debit        |
| Accounts Payable    | Liability    | accounts_payable    | 45000   | credit       |
| Bank Loan           | Liability    | loans_payable       | 200000  | credit       |
| Owner's Capital     | Equity       | capital             | 100000  | credit       |
| Sales Revenue       | Income       | sales               | 0       | credit       |
| Cost of Goods Sold  | Expense      | cost_of_goods_sold  | 0       | debit        |
| Rent Expense        | Expense      | rent_expense        | 0       | debit        |

## Common Errors and Solutions

### Error: "subtype is not a valid enum value"

**Cause**: The Account Group value in your Excel file doesn't match the allowed subtypes.

**Solution**:

1. Check the Account Group column in your Excel file
2. Ensure the values exactly match one of the valid subtypes listed above
3. Note: The system automatically converts spaces to underscores and makes text lowercase

**Example**:

- ✅ Use "Bank" (will become "bank")
- ✅ Use "Fixed Asset" (will become "fixed_asset")
- ❌ Don't use "Loans" if you meant "loans" (case sensitive after conversion)

### Common Variations and Synonyms

The system automatically handles these common variations:

| Your Excel Value | System Maps To |
|------------------|----------------|
| "Non-Current Liability" | "long_term_liability" |
| "Non Current Liability" | "long_term_liability" |
| "Noncurrent Liability" | "long_term_liability" |
| "Long Term Liability" | "long_term_liability" |
| "Current Liabilities" | "current_liability" |
| "Accounts Receivables" | "accounts_receivable" |
| "Fixed Assets" | "fixed_asset" |
| "Cost of Goods" | "cost_of_goods_sold" |
| "COGS" | "cost_of_goods_sold" |
| "Operating Expenses" | "operating_expense" |

### Error: "Account name is required"

**Cause**: Empty or missing account names in the Excel file.

**Solution**: Ensure all rows have account names in column A.

### Error: "Account type is required"

**Cause**: Empty or missing account heads in the Excel file.

**Solution**: Ensure all rows have valid account heads (Asset, Liability, Equity, Income, Expense) in column B.

## Upload Process

1. **Prepare your Excel file** with the correct format
2. **Click "Import Excel"** in the Chart of Accounts page
3. **Select your file** (.xlsx or .xls format)
4. **Review the preview** to ensure data looks correct
5. **Click "Upload"** to import the accounts
6. **Check the results** for any errors or warnings

## Tips for Successful Upload

1. **Use the sample format** provided in the upload dialog
2. **Validate your data** before uploading
3. **Check for typos** in account groups
4. **Ensure consistent naming** conventions
5. **Backup your data** before bulk imports
6. **Start with a small test file** to verify the format

## Download Sample File

You can download a sample Excel file from the upload dialog to see the exact format required.

## Support

If you encounter issues:

1. Check the error messages for specific guidance
2. Verify your Excel format matches the requirements
3. Ensure all account groups are from the valid list above
4. Contact support if you need additional help
