import XLSX from "xlsx";
import Customer from "../models/Customer.js";
import { logAction } from "./auditTrailservice.js";

export class CustomerExcelService {
  /**
   * Parse Excel file buffer and return JSON data
   */
  static async parseExcelFile(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      return jsonData;
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  /**
   * Validate customer data from Excel
   */
  static validateCustomerData(customerData, rowNumber) {
    const errors = [];

    // Required fields validation
    if (!customerData.firstName?.trim()) {
      errors.push(`Row ${rowNumber}: First name is required`);
    }

    if (!customerData.lastName?.trim()) {
      errors.push(`Row ${rowNumber}: Last name is required`);
    }

    if (!customerData.email?.trim()) {
      errors.push(`Row ${rowNumber}: Email is required`);
    } else {
      // Email format validation
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(customerData.email)) {
        errors.push(`Row ${rowNumber}: Invalid email format`);
      }
    }

    // Customer type validation
    if (
      customerData.customerType &&
      !["Business", "Individual"].includes(customerData.customerType)
    ) {
      errors.push(
        `Row ${rowNumber}: Customer type must be 'Business' or 'Individual'`
      );
    }

    // Salutation validation
    if (
      customerData.salutation &&
      !["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."].includes(customerData.salutation)
    ) {
      errors.push(`Row ${rowNumber}: Invalid salutation`);
    }

    // Currency validation
    if (
      customerData.currency &&
      !["INR", "USD", "EUR", "GBP"].includes(customerData.currency)
    ) {
      errors.push(`Row ${rowNumber}: Invalid currency`);
    }

    // Payment terms validation
    const validPaymentTerms = [
      "Due on Receipt",
      "Net 15",
      "Net 30",
      "Net 45",
      "Net 60",
    ];
    if (
      customerData.paymentTerms &&
      !validPaymentTerms.includes(customerData.paymentTerms)
    ) {
      errors.push(`Row ${rowNumber}: Invalid payment terms`);
    }

    // Opening balance validation
    if (
      customerData.openingBalance &&
      isNaN(parseFloat(customerData.openingBalance))
    ) {
      errors.push(`Row ${rowNumber}: Opening balance must be a valid number`);
    }

    // Phone number validation (basic)
    if (customerData.workPhone && customerData.workPhone.length < 10) {
      errors.push(
        `Row ${rowNumber}: Work phone number must be at least 10 digits`
      );
    }

    if (customerData.mobile && customerData.mobile.length < 10) {
      errors.push(`Row ${rowNumber}: Mobile number must be at least 10 digits`);
    }

    return errors;
  }

  /**
   * Parse rows from Excel data
   */
  static parseRows(rows) {
    if (rows.length === 0) {
      return [];
    }

    // Expected headers (can be in any order)
    const expectedHeaders = [
      "customerType",
      "salutation",
      "firstName",
      "lastName",
      "companyName",
      "displayName",
      "email",
      "workPhone",
      "mobile",
      "pan",
      "currency",
      "openingBalance",
      "paymentTerms",
      "portalEnabled",
      "portalLanguage",
      "billingStreet",
      "billingCity",
      "billingState",
      "billingCountry",
      "billingZipCode",
      "shippingStreet",
      "shippingCity",
      "shippingState",
      "shippingCountry",
      "shippingZipCode",
    ];

    // Get header row
    const headerRow = rows[0];
    const dataRows = rows.slice(1);

    // Map headers to column indices
    const headerMap = {};
    headerRow.forEach((header, index) => {
      if (header) {
        const normalizedHeader = header.toString().trim().toLowerCase();
        // Find matching expected header
        const matchedHeader = expectedHeaders.find(
          (h) =>
            h.toLowerCase() === normalizedHeader ||
            h
              .toLowerCase()
              .replace(/([A-Z])/g, "_$1")
              .toLowerCase() === normalizedHeader ||
            normalizedHeader.includes(h.toLowerCase()) ||
            h.toLowerCase().includes(normalizedHeader)
        );
        if (matchedHeader) {
          headerMap[matchedHeader] = index;
        }
      }
    });

    return dataRows
      .map((row, index) => {
        const rowNumber = index + 2; // +2 because we skip header and arrays are 0-indexed

        if (!row || row.every((cell) => !cell)) {
          return null; // Skip empty rows
        }

        const customerData = {
          customerType:
            this.getCellValue(row, headerMap.customerType) || "Business",
          salutation: this.getCellValue(row, headerMap.salutation) || "Mr.",
          firstName: this.getCellValue(row, headerMap.firstName) || "",
          lastName: this.getCellValue(row, headerMap.lastName) || "",
          companyName: this.getCellValue(row, headerMap.companyName) || "",
          displayName: this.getCellValue(row, headerMap.displayName) || "",
          email: this.getCellValue(row, headerMap.email) || "",
          workPhone: this.getCellValue(row, headerMap.workPhone) || "",
          mobile: this.getCellValue(row, headerMap.mobile) || "",
          pan: this.getCellValue(row, headerMap.pan) || "",
          currency: this.getCellValue(row, headerMap.currency) || "INR",
          openingBalance:
            parseFloat(this.getCellValue(row, headerMap.openingBalance)) || 0,
          paymentTerms:
            this.getCellValue(row, headerMap.paymentTerms) || "Due on Receipt",
          portalEnabled:
            this.getBooleanValue(
              this.getCellValue(row, headerMap.portalEnabled)
            ) || false,
          portalLanguage:
            this.getCellValue(row, headerMap.portalLanguage) || "English",
          billingAddress: {
            street: this.getCellValue(row, headerMap.billingStreet) || "",
            city: this.getCellValue(row, headerMap.billingCity) || "",
            state: this.getCellValue(row, headerMap.billingState) || "",
            country: this.getCellValue(row, headerMap.billingCountry) || "",
            zipCode: this.getCellValue(row, headerMap.billingZipCode) || "",
          },
          shippingAddress: {
            street: this.getCellValue(row, headerMap.shippingStreet) || "",
            city: this.getCellValue(row, headerMap.shippingCity) || "",
            state: this.getCellValue(row, headerMap.shippingState) || "",
            country: this.getCellValue(row, headerMap.shippingCountry) || "",
            zipCode: this.getCellValue(row, headerMap.shippingZipCode) || "",
          },
          rowNumber,
        };

        // Auto-generate display name if not provided
        if (!customerData.displayName.trim()) {
          customerData.displayName =
            customerData.customerType === "Business"
              ? customerData.companyName ||
                `${customerData.firstName} ${customerData.lastName}`
              : `${customerData.firstName} ${customerData.lastName}`;
        }

        return customerData;
      })
      .filter((row) => row && row.firstName && row.lastName && row.email); // Only include complete rows
  }

  /**
   * Helper to get cell value safely
   */
  static getCellValue(row, columnIndex) {
    if (
      columnIndex === undefined ||
      columnIndex === null ||
      !row[columnIndex]
    ) {
      return "";
    }
    return row[columnIndex].toString().trim();
  }

  /**
   * Helper to convert string to boolean
   */
  static getBooleanValue(value) {
    if (!value) return false;
    const strValue = value.toString().toLowerCase().trim();
    return ["true", "yes", "1", "on", "enabled"].includes(strValue);
  }

  /**
   * Check for duplicate customers
   */
  static async checkDuplicates(customers) {
    const duplicates = [];
    const emails = customers.map((c) => c.email.toLowerCase());
    const displayNames = customers.map((c) => c.displayName.toLowerCase());

    // Check for duplicates within the upload
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];

      // Check email duplicates
      const emailDuplicates = emails
        .map((email, index) => ({
          email,
          index,
          rowNumber: customers[index].rowNumber,
        }))
        .filter(
          (item) =>
            item.email === customer.email.toLowerCase() && item.index !== i
        );

      if (emailDuplicates.length > 0) {
        duplicates.push({
          type: "email",
          value: customer.email,
          rows: [
            customer.rowNumber,
            ...emailDuplicates.map((d) => d.rowNumber),
          ],
          message: `Duplicate email found in rows: ${[
            customer.rowNumber,
            ...emailDuplicates.map((d) => d.rowNumber),
          ].join(", ")}`,
        });
      }

      // Check display name duplicates
      const displayNameDuplicates = displayNames
        .map((name, index) => ({
          name,
          index,
          rowNumber: customers[index].rowNumber,
        }))
        .filter(
          (item) =>
            item.name === customer.displayName.toLowerCase() && item.index !== i
        );

      if (displayNameDuplicates.length > 0) {
        duplicates.push({
          type: "displayName",
          value: customer.displayName,
          rows: [
            customer.rowNumber,
            ...displayNameDuplicates.map((d) => d.rowNumber),
          ],
          message: `Duplicate display name found in rows: ${[
            customer.rowNumber,
            ...displayNameDuplicates.map((d) => d.rowNumber),
          ].join(", ")}`,
        });
      }
    }

    // Check for existing customers in database
    const existingEmails = await Customer.find({
      email: { $in: emails },
      isActive: true,
    }).select("email displayName");

    const existingDisplayNames = await Customer.find({
      displayName: { $in: displayNames },
      isActive: true,
    }).select("email displayName");

    for (const existing of existingEmails) {
      const customer = customers.find(
        (c) => c.email.toLowerCase() === existing.email.toLowerCase()
      );
      if (customer) {
        duplicates.push({
          type: "email",
          value: existing.email,
          rows: [customer.rowNumber],
          message: `Row ${customer.rowNumber}: Email '${existing.email}' already exists in database`,
        });
      }
    }

    for (const existing of existingDisplayNames) {
      const customer = customers.find(
        (c) =>
          c.displayName.toLowerCase() === existing.displayName.toLowerCase()
      );
      if (customer) {
        duplicates.push({
          type: "displayName",
          value: existing.displayName,
          rows: [customer.rowNumber],
          message: `Row ${customer.rowNumber}: Display name '${existing.displayName}' already exists in database`,
        });
      }
    }

    return duplicates;
  }

  /**
   * Create customers in bulk
   */
  static async createCustomers(customers, userId, options = {}) {
    const { skipDuplicates = false, updateExisting = false } = options;

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    for (const customerData of customers) {
      try {
        // Check if customer exists
        const existingCustomer = await Customer.findOne({
          $or: [
            { email: { $regex: new RegExp(`^${customerData.email}$`, "i") } },
            {
              displayName: {
                $regex: new RegExp(`^${customerData.displayName}$`, "i"),
              },
            },
          ],
          isActive: true,
        });

        if (existingCustomer) {
          if (updateExisting) {
            // Update existing customer
            const updateData = { ...customerData };
            delete updateData.rowNumber;
            updateData.updatedBy = userId;

            await Customer.findByIdAndUpdate(existingCustomer._id, updateData, {
              new: true,
              runValidators: true,
            });
            results.updated++;

            // Log audit trail for update
            await logAction({
              user: userId,
              action: "update",
              entity: "customer",
              entityId: existingCustomer._id,
              message: `Customer "${customerData.displayName}" updated via bulk upload`,
              details: updateData,
              ipAddress: "bulk-upload",
              userAgent: "Excel Import Service",
            });
          } else if (skipDuplicates) {
            results.skipped++;
          } else {
            results.errors.push(
              `Row ${customerData.rowNumber}: Customer with email '${customerData.email}' or display name '${customerData.displayName}' already exists`
            );
          }
        } else {
          // Create new customer
          const newCustomerData = { ...customerData };
          delete newCustomerData.rowNumber;
          newCustomerData.createdBy = userId;
          newCustomerData.isActive = true;

          const customer = new Customer(newCustomerData);
          await customer.save();
          results.created++;

          // Log audit trail for creation
          await logAction({
            user: userId,
            action: "create",
            entity: "customer",
            entityId: customer._id,
            message: `Customer "${customerData.displayName}" created via bulk upload`,
            details: newCustomerData,
            ipAddress: "bulk-upload",
            userAgent: "Excel Import Service",
          });
        }
      } catch (error) {
        results.errors.push(`Row ${customerData.rowNumber}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Process bulk customer upload
   */
  static async processBulkUpload(fileBuffer, userId, options = {}) {
    try {
      // Step 1: Parse Excel file
      const rows = await this.parseExcelFile(fileBuffer);

      if (rows.length === 0) {
        throw new Error("Excel file is empty");
      }

      if (rows.length === 1) {
        throw new Error("Excel file contains only headers, no data rows found");
      }

      // Step 2: Parse and validate customer data
      const customers = this.parseRows(rows);

      if (customers.length === 0) {
        throw new Error("No valid customer data found in Excel file");
      }

      // Step 3: Validate all customers
      const allErrors = [];
      for (const customer of customers) {
        const errors = this.validateCustomerData(customer, customer.rowNumber);
        allErrors.push(...errors);
      }

      // Step 4: Check for duplicates
      const duplicates = await this.checkDuplicates(customers);

      if (
        duplicates.length > 0 &&
        !options.skipDuplicates &&
        !options.updateExisting
      ) {
        const duplicateMessages = duplicates.map((d) => d.message);
        allErrors.push(...duplicateMessages);
      }

      if (allErrors.length > 0 && !options.ignoreErrors) {
        throw new Error(`Validation errors:\n${allErrors.join("\n")}`);
      }

      // Step 5: Create customers
      const results = await this.createCustomers(customers, userId, options);

      return {
        success: true,
        data: results,
        totalProcessed: customers.length,
        summary: {
          totalRows: rows.length - 1, // Exclude header
          validCustomers: customers.length,
          created: results.created,
          updated: results.updated,
          skipped: results.skipped,
          errors: results.errors.length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to process bulk upload: ${error.message}`);
    }
  }

  /**
   * Generate Excel template for customer upload
   */
  static generateExcelTemplate() {
    const headers = [
      "customerType",
      "salutation",
      "firstName",
      "lastName",
      "companyName",
      "displayName",
      "email",
      "workPhone",
      "mobile",
      "pan",
      "currency",
      "openingBalance",
      "paymentTerms",
      "portalEnabled",
      "portalLanguage",
      "billingStreet",
      "billingCity",
      "billingState",
      "billingCountry",
      "billingZipCode",
      "shippingStreet",
      "shippingCity",
      "shippingState",
      "shippingCountry",
      "shippingZipCode",
    ];

    const sampleData = [
      [
        "Business",
        "Mr.",
        "John",
        "Doe",
        "Acme Corp",
        "John Doe - Acme Corp",
        "john.doe@acme.com",
        "+1234567890",
        "+1234567890",
        "ABCDE1234F",
        "INR",
        "1000",
        "Net 30",
        "true",
        "English",
        "123 Business St",
        "Mumbai",
        "Maharashtra",
        "India",
        "400001",
        "123 Business St",
        "Mumbai",
        "Maharashtra",
        "India",
        "400001",
      ],
      [
        "Individual",
        "Ms.",
        "Jane",
        "Smith",
        "",
        "Jane Smith",
        "jane.smith@email.com",
        "+9876543210",
        "+9876543210",
        "FGHIJ5678K",
        "INR",
        "500",
        "Due on Receipt",
        "false",
        "English",
        "456 Home Ave",
        "Delhi",
        "Delhi",
        "India",
        "110001",
        "456 Home Ave",
        "Delhi",
        "Delhi",
        "India",
        "110001",
      ],
    ];

    const exportData = [headers, ...sampleData];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);

    // Set column widths
    worksheet["!cols"] = [
      { width: 15 }, // customerType
      { width: 12 }, // salutation
      { width: 15 }, // firstName
      { width: 15 }, // lastName
      { width: 20 }, // companyName
      { width: 25 }, // displayName
      { width: 25 }, // email
      { width: 15 }, // workPhone
      { width: 15 }, // mobile
      { width: 15 }, // pan
      { width: 10 }, // currency
      { width: 15 }, // openingBalance
      { width: 15 }, // paymentTerms
      { width: 12 }, // portalEnabled
      { width: 15 }, // portalLanguage
      { width: 20 }, // billingStreet
      { width: 15 }, // billingCity
      { width: 15 }, // billingState
      { width: 15 }, // billingCountry
      { width: 10 }, // billingZipCode
      { width: 20 }, // shippingStreet
      { width: 15 }, // shippingCity
      { width: 15 }, // shippingState
      { width: 15 }, // shippingCountry
      { width: 10 }, // shippingZipCode
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Template");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  }
}
