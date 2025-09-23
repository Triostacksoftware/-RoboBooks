import BankAccount from '../models/BankAccount.js';
import BankTransaction from '../models/BankTransaction.js';
import BankStatementImport from '../models/BankStatementImport.js';
import fileProcessingService from '../services/fileProcessingService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/bank-statements';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.pdf', '.ofx', '.qif', '.xml'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

class BankingController {
  // Get all bank accounts for a user
  async getBankAccounts(req, res) {
    try {
      console.log("🔍 getBankAccounts - req.user:", req.user);
      console.log("🔍 getBankAccounts - req.user.id:", req.user?.id);
      
      const accounts = await BankAccount.find({ userId: req.user.id }).sort({ createdAt: -1 });
      console.log("🔍 getBankAccounts - Found accounts:", accounts.length);
      
      res.json({ success: true, data: accounts });
    } catch (error) {
      console.error("🔍 getBankAccounts - Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Create a new bank account
  async createBankAccount(req, res) {
    try {
      console.log("🔍 createBankAccount - req.user:", req.user);
      console.log("🔍 createBankAccount - req.user.id:", req.user?.id);
      console.log("🔍 createBankAccount - req.body:", req.body);
      
      const {
        name,
        accountCode,
        currency,
        accountNumber,
        bankName,
        ifsc,
        description,
        isPrimary,
        accountType
      } = req.body;

      const account = new BankAccount({
        userId: req.user.id,
        name,
        accountCode,
        currency,
        accountNumber,
        bankName,
        ifsc,
        description,
        isPrimary: isPrimary || false,
        accountType
      });

      console.log("🔍 createBankAccount - Account to save:", account);
      await account.save();
      console.log("🔍 createBankAccount - Account saved successfully");
      
      res.status(201).json({ success: true, data: account });
    } catch (error) {
      console.error("🔍 createBankAccount - Error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Update bank account
  async updateBankAccount(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const account = await BankAccount.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        updates,
        { new: true, runValidators: true }
      );

      if (!account) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }

      res.json({ success: true, data: account });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Delete bank account
  async deleteBankAccount(req, res) {
    try {
      const { id } = req.params;
      
      const account = await BankAccount.findOneAndDelete({ _id: id, userId: req.user.id });
      
      if (!account) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }

      res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get transactions for an account
  async getTransactions(req, res) {
    try {
      const { page = 1, limit = 1000, status, accountId } = req.query; // Increased default limit
      
      const query = { userId: req.user.id };
      if (accountId) query.accountId = accountId;
      if (status) query.status = status;

      const transactions = await BankTransaction.find(query)
        .populate('accountId', 'name bankName')
        .sort({ date: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await BankTransaction.countDocuments(query);

      res.json({
        success: true,
        data: transactions,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: page * limit < total
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Upload bank statement file
  async uploadStatement(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

        const { accountId } = req.body;
        if (!accountId) {
          return res.status(400).json({ success: false, message: 'Account ID is required' });
        }

        // Verify account belongs to user
        const account = await BankAccount.findOne({ _id: accountId, userId: req.user.id });
        if (!account) {
          return res.status(404).json({ success: false, message: 'Account not found' });
        }

        // Process the file
        const fileType = fileProcessingService.detectFileType(req.file.originalname);
        console.log('📁 File type detected:', fileType);
        
        const data = await fileProcessingService.processFile(req.file.path, fileType);
        console.log('📊 Raw data length:', data.length);
        console.log('📊 Raw data sample:', data.slice(0, 3));
        
        const headers = fileProcessingService.extractHeaders(data);
        console.log('📋 Extracted headers:', headers);
        
        const autoMapping = fileProcessingService.autoMapFields(headers);

        console.log('🔍 Auto-mapping detected:', autoMapping);
        console.log('🔍 Auto-mapping type:', typeof autoMapping);
        console.log('🔍 Auto-mapping keys:', Object.keys(autoMapping || {}));
        console.log('📊 Sample data:', data.slice(0, 2));

        // Create import record with raw data first
        const importRecord = new BankStatementImport({
          userId: req.user.id,
          accountId,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType,
          totalRows: data.length,
          originalHeaders: headers,
          fieldMapping: autoMapping,
          processedData: [], // Initialize as empty array, will be populated during mapping
          importStatus: 'mapping',
          originalData: data // Store original raw data separately
        });

        await importRecord.save();

        const responseData = {
          success: true,
          data: {
            importId: importRecord._id,
            fileName: req.file.originalname,
            totalRows: data.length,
            headers,
            fieldMapping: autoMapping, // Changed from autoMapping to fieldMapping
            sampleData: data.slice(0, 5) // First 5 rows for preview
          }
        };
        
        console.log('📤 Sending response:', JSON.stringify(responseData, null, 2));
        res.json(responseData);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update field mapping
  async updateFieldMapping(req, res) {
    try {
      const { importId } = req.params;
      const { fieldMapping, dateFormat, decimalFormat } = req.body;

      const importRecord = await BankStatementImport.findOne({
        _id: importId,
        userId: req.user.id
      });

      if (!importRecord) {
        return res.status(404).json({ success: false, message: 'Import record not found' });
      }

      // Update mapping and reprocess data
      importRecord.fieldMapping = fieldMapping;
      importRecord.dateFormat = dateFormat;
      importRecord.decimalFormat = decimalFormat;
      importRecord.importStatus = 'mapping';

      console.log('🔍 Field mapping received:', fieldMapping);
      console.log('📊 Sample raw data:', importRecord.processedData.slice(0, 2));

      // Process data with new mapping from processedData (which contains the raw Excel data)
      const processedData = importRecord.processedData.map(row => {
        const processed = {};
        
        console.log('🔍 Processing original row:', row);
        console.log('🔍 Field mapping withdrawals:', fieldMapping.withdrawals);
        console.log('🔍 Row withdrawals value:', row[fieldMapping.withdrawals]);
        
        // Date mapping with better parsing
        if (fieldMapping.date && row[fieldMapping.date]) {
          const dateStr = String(row[fieldMapping.date]).trim();
          let parsedDate;

          // Handle DD-MM-YYYY format (common in Indian banking)
          if (dateStr.includes('-') && dateStr.split('-').length === 3) {
            const parts = dateStr.split('-');
            if (parts[0].length === 2 && parts[1].length === 2) {
              // DD-MM-YYYY format
              parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            } else {
              parsedDate = new Date(dateStr);
            }
          } else {
            parsedDate = new Date(dateStr);
          }
          
          processed.date = !isNaN(parsedDate.getTime()) ? parsedDate : new Date();
        } else {
          processed.date = new Date();
        }

        // Description mapping using enhanced method
        processed.description = fileProcessingService.generateDescription(row, fieldMapping);
        console.log('🔍 Generated description:', processed.description);

        // Payee mapping
        processed.payee = fieldMapping.payee && row[fieldMapping.payee]
          ? String(row[fieldMapping.payee]).trim()
          : '';

        // Reference Number mapping
        processed.referenceNumber = fieldMapping.referenceNumber && row[fieldMapping.referenceNumber]
          ? String(row[fieldMapping.referenceNumber]).trim()
          : '';

        // Category mapping
        processed.category = fieldMapping.category && row[fieldMapping.category]
          ? String(row[fieldMapping.category]).trim()
          : '';

        // Status mapping
        processed.status = fieldMapping.status && row[fieldMapping.status]
          ? String(row[fieldMapping.status]).trim()
          : 'pending';

        // Use the enhanced parseAmount method from fileProcessingService
        const parseAmount = fileProcessingService.parseAmount.bind(fileProcessingService);

        // Handle withdrawals (debit amounts)
        const withdrawalKey = fieldMapping.withdrawals;
        const withdrawalValue = withdrawalKey ? row[withdrawalKey] : null;
        processed.withdrawals = parseAmount(withdrawalValue);
        console.log('🔍 Withdrawal key:', withdrawalKey);
        console.log('🔍 Withdrawal value:', withdrawalValue);
        console.log('🔍 Withdrawal amount parsed:', processed.withdrawals);

        // Handle deposits (credit amounts)
        const depositKey = fieldMapping.deposits;
        const depositValue = depositKey ? row[depositKey] : null;
        processed.deposits = parseAmount(depositValue);
        console.log('🔍 Deposit key:', depositKey);
        console.log('🔍 Deposit value:', depositValue);
        console.log('🔍 Deposit amount parsed:', processed.deposits);

        // Determine final amount and type
        if (processed.withdrawals > 0) {
          processed.amount = -processed.withdrawals; // Negative for withdrawals
          processed.type = 'debit';
        } else if (processed.deposits > 0) {
          processed.amount = processed.deposits; // Positive for deposits
          processed.type = 'credit';
        } else {
          // Check if there are any non-zero values in debit/credit columns
          const hasDebit = withdrawalValue && parseFloat(withdrawalValue) > 0;
          const hasCredit = depositValue && parseFloat(depositValue) > 0;
          
          if (hasDebit) {
            processed.amount = -parseFloat(withdrawalValue);
            processed.type = 'debit';
          } else if (hasCredit) {
            processed.amount = parseFloat(depositValue);
            processed.type = 'credit';
          } else {
            processed.amount = 0;
            processed.type = 'unknown';
          }
        }

        processed.status = 'ready';
        processed.errors = [];

        console.log('🔍 Final processed data:', processed);
        return processed;
      });

      importRecord.processedData = processedData;
      importRecord.importStatus = 'preview';
      await importRecord.save();

      const readyRows = processedData.filter(row => row.status === 'ready');
      console.log('📊 Total processed rows:', processedData.length);
      console.log('📊 Ready rows:', readyRows.length);
      console.log('📊 Sample ready rows:', readyRows.slice(0, 3));

      res.json({
        success: true,
        data: {
          sampleData: readyRows.slice(0, 5), // Return sample data for preview
          totalRows: processedData.length,
          readyRows: readyRows.length
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Import transactions
  async processImportTransactions(req, res) {
    try {
      const { importId } = req.params;
      
      const importRecord = await BankStatementImport.findOne({
        _id: importId,
        userId: req.user.id
      });

      if (!importRecord) {
        return res.status(404).json({ success: false, message: 'Import record not found' });
      }

      if (importRecord.importStatus !== 'preview') {
        return res.status(400).json({ success: false, message: 'Import not ready for processing' });
      }

      // Create transactions
      const transactions = [];
      console.log('🔄 Processing import data, total rows:', importRecord.processedData.length);
      
      for (const row of importRecord.processedData) {
        if (row.status === 'ready' && row.amount !== 0) {
          const transaction = new BankTransaction({
            accountId: importRecord.accountId,
            userId: req.user.id,
            date: row.date,
            description: row.description || 'Imported Transaction',
            payee: row.payee || '',
            referenceNumber: row.referenceNumber || '',
            withdrawals: row.withdrawals || 0,
            deposits: row.deposits || 0,
            amount: row.amount,
            type: row.type,
            category: row.category || '',
            status: row.status || 'pending',
            importSource: importRecord.fileType,
            importBatchId: importRecord.importBatchId,
            originalData: row
          });
          transactions.push(transaction);
          console.log('✅ Created transaction:', transaction.description, 'Amount:', transaction.amount, 'Type:', transaction.type);
        } else {
          console.log('⏭️ Skipped row:', row.description, 'Status:', row.status, 'Amount:', row.amount);
        }
      }

      console.log('📊 Total transactions to save:', transactions.length);
      
      // Save all transactions
      if (transactions.length > 0) {
        await BankTransaction.insertMany(transactions);
        console.log('✅ Successfully saved', transactions.length, 'transactions');
      } else {
        console.log('⚠️ No valid transactions to save');
      }

      // Update import status
      importRecord.importStatus = 'imported';
      importRecord.importedRows = transactions.length;
      await importRecord.save();

      res.json({
        success: true,
        message: `Successfully imported ${transactions.length} transactions`,
        data: {
          importedCount: transactions.length,
          importBatchId: importRecord.importBatchId
        }
      });
    } catch (error) {
      console.error('❌ Import error:', error);
      console.error('❌ Import error message:', error.message);
      console.error('❌ Import error stack:', error.stack);
      res.status(500).json({ 
        success: false, 
        message: `Import failed: ${error.message}`,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Get import status
  async getImportStatus(req, res) {
    try {
      const { importId } = req.params;
      
      const importRecord = await BankStatementImport.findOne({
        _id: importId,
        userId: req.user.id
      });

      if (!importRecord) {
        return res.status(404).json({ success: false, message: 'Import record not found' });
      }

      res.json({
        success: true,
        data: {
          status: importRecord.importStatus,
          fileName: importRecord.fileName,
          totalRows: importRecord.totalRows,
          importedRows: importRecord.importedRows,
          errorRows: importRecord.errorRows,
          fieldMapping: importRecord.fieldMapping,
          processedData: importRecord.processedData
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get banking overview
  async getBankingOverview(req, res) {
    try {
      const accounts = await BankAccount.find({ userId: req.user.id, status: 'active' });
      const pendingTransactions = await BankTransaction.countDocuments({ 
        userId: req.user.id, 
        status: 'pending' 
      });
      
      const overview = {
        totalAccounts: accounts.length,
        totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
        pendingTransactions: pendingTransactions,
        accounts: accounts.map(acc => ({
          id: acc._id,
          name: acc.name,
          balance: acc.balance,
          currency: acc.currency,
          type: acc.accountType
        }))
      };

      res.json({ success: true, data: overview });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get single bank account
  async getBankAccount(req, res) {
    try {
      const { id } = req.params;
      const account = await BankAccount.findOne({ _id: id, userId: req.user.id });
      
      if (!account) {
        return res.status(404).json({ success: false, message: 'Bank account not found' });
      }
      
      res.json({ success: true, data: account });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Sync bank account
  async syncBankAccount(req, res) {
    try {
      const { id } = req.params;
      const account = await BankAccount.findOne({ _id: id, userId: req.user.id });
      
      if (!account) {
        return res.status(404).json({ success: false, message: 'Bank account not found' });
      }
      
      // Simulate sync process
      res.json({ success: true, message: 'Account sync initiated' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get single transaction
  async getTransaction(req, res) {
    try {
      const { id } = req.params;
      const transaction = await BankTransaction.findOne({ _id: id, userId: req.user.id });
      
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      
      res.json({ success: true, data: transaction });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Create transaction
  async createTransaction(req, res) {
    try {
      const { 
        accountId, 
        date, 
        description, 
        amount, 
        type, 
        category, 
        payee, 
        referenceNumber,
        withdrawals,
        deposits 
      } = req.body;
      
      console.log('🔄 Creating manual transaction:', { accountId, date, description, amount, type });

      // Validate required fields
      if (!accountId || !date || !description || !amount || !type) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: accountId, date, description, amount, type' 
        });
      }

      // Calculate withdrawals and deposits based on type and amount
      let finalWithdrawals = 0;
      let finalDeposits = 0;
      let finalAmount = parseFloat(amount);

      if (type === 'debit' || type === 'withdrawal') {
        finalWithdrawals = Math.abs(finalAmount);
        finalAmount = -Math.abs(finalAmount); // Negative for debits
      } else if (type === 'credit' || type === 'deposit') {
        finalDeposits = Math.abs(finalAmount);
        finalAmount = Math.abs(finalAmount); // Positive for credits
      }

      // Use provided values if available
      if (withdrawals !== undefined) finalWithdrawals = parseFloat(withdrawals);
      if (deposits !== undefined) finalDeposits = parseFloat(deposits);

      const transaction = new BankTransaction({
        accountId,
        userId: req.user.id,
        date: new Date(date),
        description: description.trim(),
        payee: payee ? payee.trim() : '',
        referenceNumber: referenceNumber ? referenceNumber.trim() : '',
        withdrawals: finalWithdrawals,
        deposits: finalDeposits,
        amount: finalAmount,
        type,
        category: category || '',
        status: 'pending',
        importSource: 'manual'
      });

      await transaction.save();
      await transaction.populate('accountId', 'name bankName');

      console.log('✅ Manual transaction created:', transaction._id, transaction.description, transaction.amount);

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction
      });
    } catch (error) {
      console.error('❌ Create transaction error:', error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to create transaction: ${error.message}` 
      });
    }
  }

  // Update transaction
  async updateTransaction(req, res) {
    try {
      const { id } = req.params;
      const transaction = await BankTransaction.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        req.body,
        { new: true }
      );
      
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      
      res.json({ success: true, data: transaction });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Delete transaction
  async deleteTransaction(req, res) {
    try {
      const { id } = req.params;
      console.log('🗑️ Backend: Deleting transaction with ID:', id);
      console.log('🗑️ Backend: User ID:', req.user.id);
      
      const transaction = await BankTransaction.findOneAndDelete({ _id: id, userId: req.user.id });
      
      if (!transaction) {
        console.log('🗑️ Backend: Transaction not found');
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      
      console.log('🗑️ Backend: Transaction deleted successfully:', transaction.description);
      res.json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('🗑️ Backend: Delete transaction error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Reconcile transaction
  async reconcileTransaction(req, res) {
    try {
      const { id } = req.params;
      const transaction = await BankTransaction.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        { isReconciled: true },
        { new: true }
      );
      
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      
      res.json({ success: true, data: transaction });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Categorize transaction
  async categorizeTransaction(req, res) {
    try {
      const { id } = req.params;
      const { category, subcategory } = req.body;
      
      const transaction = await BankTransaction.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        { category, subcategory },
        { new: true }
      );
      
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      
      res.json({ success: true, data: transaction });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get transaction categories
  async getTransactionCategories(req, res) {
    try {
      const categories = [
        'Income', 'Expense', 'Transfer', 'Investment', 'Loan', 'Other'
      ];
      
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get transaction summary
  async getTransactionSummary(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const query = { userId: req.user.id };
      
      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const transactions = await BankTransaction.find(query);
      
      const summary = {
        totalTransactions: transactions.length,
        totalIncome: transactions
          .filter(t => t.type === 'credit')
          .reduce((sum, t) => sum + t.amount, 0),
        totalExpense: transactions
          .filter(t => t.type === 'debit')
          .reduce((sum, t) => sum + t.amount, 0),
        netAmount: transactions
          .reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0)
      };
      
      res.json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get reconciliations
  async getReconciliations(req, res) {
    try {
      const { accountId } = req.query;
      const query = { userId: req.user.id };
      
      if (accountId) {
        query.accountId = accountId;
      }
      
      const reconciliations = await BankTransaction.find({
        ...query,
        isReconciled: false
      }).populate('accountId', 'name bankName');
      
      res.json({ success: true, data: reconciliations });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get reconciliation for specific account
  async getAccountReconciliations(req, res) {
    try {
      const { accountId } = req.params;
      
      // Verify account belongs to user
      const account = await BankAccount.findOne({ _id: accountId, userId: req.user.id });
      if (!account) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }
      
      // Get unreconciled transactions for this account
      const unreconciledTransactions = await BankTransaction.find({
        accountId,
        userId: req.user.id,
        isReconciled: false
      }).sort({ date: -1 });
      
      // Calculate reconciliation summary
      const totalUnreconciled = unreconciledTransactions.length;
      const totalUnreconciledAmount = unreconciledTransactions.reduce((sum, t) => {
        return sum + (t.type === 'credit' ? t.amount : -t.amount);
      }, 0);
      
      const reconciliation = {
        accountId,
        accountName: account.name,
        bankBalance: account.balance,
        bookBalance: account.balance - totalUnreconciledAmount,
        difference: totalUnreconciledAmount,
        unreconciledItems: totalUnreconciled,
        transactions: unreconciledTransactions
      };
      
      res.json({ success: true, data: reconciliation });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Create reconciliation
  async createReconciliation(req, res) {
    try {
      const { accountId, statementDate, statementBalance, transactions } = req.body;
      
      // Verify account belongs to user
      const account = await BankAccount.findOne({ _id: accountId, userId: req.user.id });
      if (!account) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }
      
      // Update transactions as reconciled
      if (transactions && transactions.length > 0) {
        await BankTransaction.updateMany(
          { _id: { $in: transactions }, userId: req.user.id },
          { isReconciled: true, reconciledAt: new Date() }
        );
      }
      
      // Update account balance if statement balance is provided
      if (statementBalance !== undefined) {
        await BankAccount.findByIdAndUpdate(accountId, { 
          balance: statementBalance,
          lastSync: new Date()
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Reconciliation completed successfully',
        data: {
          reconciledTransactions: transactions?.length || 0,
          newBalance: statementBalance || account.balance
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Auto-match reconciliation items
  async autoMatchReconciliation(req, res) {
    try {
      const { accountId } = req.params;
      
      // Verify account belongs to user
      const account = await BankAccount.findOne({ _id: accountId, userId: req.user.id });
      if (!account) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }
      
      // Get unreconciled transactions
      const unreconciledTransactions = await BankTransaction.find({
        accountId,
        userId: req.user.id,
        isReconciled: false
      });
      
      // Simple auto-matching logic (can be enhanced)
      const matchedTransactions = [];
      for (const transaction of unreconciledTransactions) {
        // Auto-match transactions older than 30 days
        const transactionDate = new Date(transaction.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (transactionDate < thirtyDaysAgo) {
          await BankTransaction.findByIdAndUpdate(transaction._id, {
            isReconciled: true,
            reconciledAt: new Date()
          });
          matchedTransactions.push(transaction._id);
        }
      }
      
      res.json({
        success: true,
        message: `Auto-matched ${matchedTransactions.length} transactions`,
        data: {
          matchedCount: matchedTransactions.length,
          matchedTransactions
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Import transactions for specific account and user
  async importTransactions(req, res) {
    try {
      console.log('📁 Import Transactions - Starting import process');
      const { accountId } = req.body;
      const userId = req.user.id;
      const file = req.file;

      console.log('📁 Import - Account ID:', accountId);
      console.log('📁 Import - User ID:', userId);
      console.log('📁 Import - File:', file ? file.originalname : 'No file');

      if (!file) {
        console.log('❌ Import - No file uploaded');
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      if (!accountId) {
        console.log('❌ Import - No account ID provided');
        return res.status(400).json({ success: false, message: 'Account ID is required' });
      }

      // Verify account belongs to user
      const account = await BankAccount.findOne({ _id: accountId, userId: userId });
      if (!account) {
        console.log('❌ Import - Account not found or access denied');
        return res.status(404).json({ success: false, message: 'Account not found or access denied' });
      }
      
      console.log('✅ Import - Account verified:', account.name);

      // Process the file based on its type
      let transactions = [];
      const fileExtension = path.extname(file.originalname).toLowerCase();

      try {
        console.log('📁 Import - Processing file with extension:', fileExtension);
        
        if (fileExtension === '.csv') {
          console.log('📁 Import - Processing CSV file');
          transactions = await fileProcessingService.processCSV(file.path);
        } else if (['.xlsx', '.xls'].includes(fileExtension)) {
          console.log('📁 Import - Processing Excel file');
          transactions = await fileProcessingService.processExcel(file.path);
        } else if (fileExtension === '.pdf') {
          console.log('📁 Import - Processing PDF file');
          transactions = await fileProcessingService.processPDF(file.path);
        } else {
          throw new Error(`Unsupported file type: ${fileExtension}`);
        }
        
        console.log('✅ Import - File processed successfully, transactions:', transactions.length);
        if (transactions.length > 0) {
          console.log('📊 Import - Sample transaction:', transactions[0]);
        }

        // Transform transactions to match our schema
        const transformedTransactions = transactions.map(transaction => {
          console.log('🔄 Transform - Processing transaction:', transaction);
          
          // Determine amount and type based on various column name formats
          let amount = 0;
          let type = 'deposit';
          let withdrawals = 0;
          let deposits = 0;

          // Handle different column name formats
          const debitValue = transaction['Debit (₹)'] || transaction['Debit'] || transaction.debit || transaction.withdrawals;
          const creditValue = transaction['Credit (₹)'] || transaction['Credit'] || transaction.credit || transaction.deposits;
          const amountValue = transaction.amount || transaction['Amount'] || transaction['Amount (₹)'];

          console.log('💰 Transform - Debit value:', debitValue, 'Credit value:', creditValue, 'Amount value:', amountValue);

          if (debitValue && parseFloat(debitValue) > 0) {
            withdrawals = parseFloat(debitValue);
            amount = -withdrawals;
            type = 'debit';
            console.log('💰 Transform - Set as debit:', amount);
          } else if (creditValue && parseFloat(creditValue) > 0) {
            deposits = parseFloat(creditValue);
            amount = deposits;
            type = 'credit';
            console.log('💰 Transform - Set as credit:', amount);
          } else if (amountValue) {
            amount = parseFloat(amountValue);
            if (amount >= 0) {
              deposits = amount;
              type = 'credit';
            } else {
              withdrawals = Math.abs(amount);
              type = 'debit';
            }
            console.log('💰 Transform - Set from amount:', amount, 'type:', type);
          }

          // Map file extension to valid importSource enum
          let importSource = 'manual';
          if (['.xlsx', '.xls'].includes(fileExtension)) {
            importSource = 'excel';
          } else if (fileExtension === '.csv') {
            importSource = 'csv';
          } else if (fileExtension === '.pdf') {
            importSource = 'pdf';
          }

          // Handle different date and description column formats
          const dateValue = transaction.Date || transaction.date || transaction.Date;
          const descriptionValue = transaction.Narration || transaction.Description || transaction.description || transaction.narration;
          const payeeValue = transaction.Payee || transaction.payee;
          const referenceValue = transaction.Reference || transaction.reference || transaction.ReferenceNumber || transaction.referenceNumber;

          console.log('📅 Transform - Date:', dateValue, 'Description:', descriptionValue);

          const transformedTransaction = {
            accountId: accountId,
            userId: userId,
            date: dateValue ? new Date(dateValue) : new Date(),
            description: descriptionValue || 'Imported Transaction',
            payee: payeeValue,
            referenceNumber: referenceValue,
            withdrawals: withdrawals,
            deposits: deposits,
            amount: amount,
            type: type,
            category: transaction.category,
            status: 'uncategorized', // Valid enum value
            importSource: importSource, // Valid enum value
            importBatchId: `batch_${Date.now()}`,
            originalData: transaction
          };

          console.log('✅ Transform - Final transaction:', transformedTransaction);
          return transformedTransaction;
        });

        // Save transactions to database
        console.log('💾 Save - Saving transactions to database:', transformedTransactions.length);
        const savedTransactions = await BankTransaction.insertMany(transformedTransactions);
        console.log('✅ Save - Successfully saved transactions:', savedTransactions.length);

        // Clean up uploaded file
        fs.unlinkSync(file.path);

        res.json({
          success: true,
          message: `Successfully imported ${savedTransactions.length} transactions`,
          data: {
            count: savedTransactions.length,
            accountId: accountId,
            userId: userId,
            importSource: fileExtension.substring(1),
            transactions: savedTransactions
          }
        });

      } catch (processingError) {
        console.error('❌ Import - File processing error:', processingError);
        console.error('❌ Import - Error details:', processingError.message);
        console.error('❌ Import - Error stack:', processingError.stack);
        
        // Clean up uploaded file on error
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw processingError;
      }

    } catch (error) {
      console.error('❌ Import - General error:', error);
      console.error('❌ Import - Error message:', error.message);
      console.error('❌ Import - Error stack:', error.stack);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new BankingController();


