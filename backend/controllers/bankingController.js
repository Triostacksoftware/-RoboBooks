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
      const { accountId } = req.params;
      const { page = 1, limit = 50, status } = req.query;
      
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
      upload.single('statement')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }

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
        const data = await fileProcessingService.processFile(req.file.path, fileType);
        const headers = fileProcessingService.extractHeaders(data);
        const autoMapping = fileProcessingService.autoMapFields(headers);

        // Create import record
        const importRecord = new BankStatementImport({
          userId: req.user.id,
          accountId,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType,
          totalRows: data.length,
          originalHeaders: headers,
          fieldMapping: autoMapping,
          processedData: data.map((row, index) => ({
            ...row,
            status: 'pending',
            errors: []
          }))
        });

        await importRecord.save();

        res.json({
          success: true,
          data: {
            importId: importRecord._id,
            fileName: req.file.originalname,
            totalRows: data.length,
            headers,
            autoMapping,
            sampleData: data.slice(0, 5) // First 5 rows for preview
          }
        });
      });
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

      // Process data with new mapping
      const processedData = importRecord.processedData.map(row => {
        const processed = {};
        
        // Map fields according to new mapping
        if (fieldMapping.date && row[fieldMapping.date]) {
          processed.date = new Date(row[fieldMapping.date]);
        }
        if (fieldMapping.description && row[fieldMapping.description]) {
          processed.description = row[fieldMapping.description];
        }
        if (fieldMapping.payee && row[fieldMapping.payee]) {
          processed.payee = row[fieldMapping.payee];
        }
        if (fieldMapping.referenceNumber && row[fieldMapping.referenceNumber]) {
          processed.referenceNumber = row[fieldMapping.referenceNumber];
        }
        if (fieldMapping.withdrawals && row[fieldMapping.withdrawals]) {
          processed.withdrawals = parseFloat(row[fieldMapping.withdrawals]) || 0;
        }
        if (fieldMapping.deposits && row[fieldMapping.deposits]) {
          processed.deposits = parseFloat(row[fieldMapping.deposits]) || 0;
        }

        processed.status = 'ready';
        processed.errors = [];

        return processed;
      });

      importRecord.processedData = processedData;
      importRecord.importStatus = 'preview';
      await importRecord.save();

      res.json({
        success: true,
        data: {
          processedData,
          totalRows: processedData.length,
          readyRows: processedData.filter(row => row.status === 'ready').length
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Import transactions
  async importTransactions(req, res) {
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
      for (const row of importRecord.processedData) {
        if (row.status === 'ready') {
          const transaction = new BankTransaction({
            accountId: importRecord.accountId,
            userId: req.user.id,
            date: row.date,
            description: row.description,
            payee: row.payee,
            referenceNumber: row.referenceNumber,
            withdrawals: row.withdrawals,
            deposits: row.deposits,
            importSource: importRecord.fileType,
            importBatchId: importRecord.importBatchId,
            originalData: row
          });
          transactions.push(transaction);
        }
      }

      // Save all transactions
      await BankTransaction.insertMany(transactions);

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
      res.status(500).json({ success: false, message: error.message });
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
      const accounts = await BankAccount.find({ userId: req.user.id });
      
      const overview = {
        totalAccounts: accounts.length,
        totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
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
      const transaction = new BankTransaction({
        ...req.body,
        userId: req.user.id
      });
      
      await transaction.save();
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
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
      const transaction = await BankTransaction.findOneAndDelete({ _id: id, userId: req.user.id });
      
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      
      res.json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error) {
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
      const { accountId, userId } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      if (!accountId || !userId) {
        return res.status(400).json({ success: false, message: 'Account ID and User ID are required' });
      }

      // Verify account belongs to user
      const account = await BankAccount.findOne({ _id: accountId, userId: userId });
      if (!account) {
        return res.status(404).json({ success: false, message: 'Account not found or access denied' });
      }

      // Process the file based on its type
      let transactions = [];
      const fileExtension = path.extname(file.originalname).toLowerCase();

      try {
        if (fileExtension === '.csv') {
          transactions = await fileProcessingService.processCSV(file.path);
        } else if (['.xlsx', '.xls'].includes(fileExtension)) {
          transactions = await fileProcessingService.processExcel(file.path);
        } else if (fileExtension === '.pdf') {
          transactions = await fileProcessingService.processPDF(file.path);
        } else {
          throw new Error(`Unsupported file type: ${fileExtension}`);
        }

        // Transform transactions to match our schema
        const transformedTransactions = transactions.map(transaction => ({
          accountId: accountId,
          userId: userId,
          date: transaction.date || new Date(),
          description: transaction.description || 'Imported Transaction',
          payee: transaction.payee,
          referenceNumber: transaction.referenceNumber,
          withdrawals: transaction.withdrawals || 0,
          deposits: transaction.deposits || 0,
          amount: transaction.amount || 0,
          type: transaction.amount >= 0 ? 'credit' : 'debit',
          category: transaction.category || 'Uncategorized',
          subcategory: transaction.subcategory,
          isReconciled: false,
          status: 'pending',
          importSource: fileExtension.substring(1), // Remove the dot
          importBatchId: `batch_${Date.now()}`,
        }));

        // Save transactions to database
        const savedTransactions = await BankTransaction.insertMany(transformedTransactions);

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
        // Clean up uploaded file on error
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw processingError;
      }

    } catch (error) {
      console.error('Error importing transactions:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new BankingController();


