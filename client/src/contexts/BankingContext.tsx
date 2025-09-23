"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { bankingService } from '@/services/bankingService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

// Types
interface User {
  _id: string;
  name?: string;
  email: string;
  companyName?: string;
}

interface BankAccount {
  _id: string;
  name: string;
  accountCode?: string;
  currency: string;
  accountNumber?: string;
  bankName?: string;
  ifsc?: string;
  description?: string;
  isPrimary: boolean;
  accountType: "bank" | "credit_card";
  balance: number;
  status: "active" | "inactive" | "closed";
  lastSync?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface BankTransaction {
  _id: string;
  accountId: string;
  userId: string;
  date: string;
  description: string;
  payee?: string;
  referenceNumber?: string;
  withdrawals?: number;
  deposits?: number;
  amount: number;
  type: "credit" | "debit";
  category?: string;
  subcategory?: string;
  isReconciled: boolean;
  status: "pending" | "reconciled" | "cancelled";
  importSource?: string;
  importBatchId?: string;
  createdAt: string;
  updatedAt: string;
}

interface BankingOverview {
  totalBalance: number;
  totalAccounts: number;
  accounts: Array<{
    id: string;
    name: string;
    balance: number;
    currency: string;
    type: string;
  }>;
}

interface BankingContextType {
  // Data
  accounts: BankAccount[];
  transactions: BankTransaction[];
  overview: BankingOverview | null;
  users: User[];
  
  // Loading states
  loading: {
    accounts: boolean;
    transactions: boolean;
    overview: boolean;
    users: boolean;
  };
  
  // Error states
  errors: {
    accounts: string | null;
    transactions: string | null;
    overview: string | null;
    users: string | null;
  };
  
  // Actions
  refreshAccounts: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshOverview: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Account operations
  createAccount: (accountData: Partial<BankAccount>) => Promise<BankAccount>;
  updateAccount: (id: string, accountData: Partial<BankAccount>) => Promise<BankAccount>;
  deleteAccount: (id: string) => Promise<void>;
  syncAccount: (id: string) => Promise<void>;
  
  // Transaction operations
  createTransaction: (transactionData: Partial<BankTransaction>) => Promise<BankTransaction>;
  updateTransaction: (id: string, transactionData: Partial<BankTransaction>) => Promise<BankTransaction>;
  deleteTransaction: (id: string) => Promise<void>;
  reconcileTransaction: (id: string) => Promise<void>;
  
  // Utility functions
  getAccountById: (id: string) => BankAccount | undefined;
  getTransactionsByAccount: (accountId: string) => BankTransaction[];
  getUnreconciledTransactions: () => BankTransaction[];
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
};

export const BankingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  // State
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [overview, setOverview] = useState<BankingOverview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState({
    accounts: false,
    transactions: false,
    overview: false,
    users: false,
  });
  
  const [errors, setErrors] = useState({
    accounts: null as string | null,
    transactions: null as string | null,
    overview: null as string | null,
    users: null as string | null,
  });

  // Utility functions
  const getAccountById = useCallback((id: string) => {
    return accounts.find(account => account._id === id);
  }, [accounts]);

  const getTransactionsByAccount = useCallback((accountId: string) => {
    return transactions.filter(transaction => transaction.accountId === accountId);
  }, [transactions]);

  const getUnreconciledTransactions = useCallback(() => {
    return transactions.filter(transaction => !transaction.isReconciled);
  }, [transactions]);

  // Data fetching functions
  const refreshAccounts = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(prev => ({ ...prev, accounts: true }));
      setErrors(prev => ({ ...prev, accounts: null }));
      
      const response = await bankingService.getBankAccounts();
      if (response.data && Array.isArray(response.data)) {
        setAccounts(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load accounts';
      setErrors(prev => ({ ...prev, accounts: message }));
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(prev => ({ ...prev, accounts: false }));
    }
  }, [user]);

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      setErrors(prev => ({ ...prev, transactions: null }));
      
      const response = await bankingService.getTransactions();
      if (response.data && Array.isArray(response.data)) {
        setTransactions(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load transactions';
      setErrors(prev => ({ ...prev, transactions: message }));
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  }, [user]);

  const refreshOverview = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(prev => ({ ...prev, overview: true }));
      setErrors(prev => ({ ...prev, overview: null }));
      
      const response = await bankingService.getBankingOverview();
      if (response.data) {
        setOverview(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load overview';
      setErrors(prev => ({ ...prev, overview: message }));
      console.error('Error loading overview:', error);
    } finally {
      setLoading(prev => ({ ...prev, overview: false }));
    }
  }, [user]);

  const refreshUsers = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(prev => ({ ...prev, users: true }));
      setErrors(prev => ({ ...prev, users: null }));
      
      // For now, we'll create a mock users list
      // In a real app, you'd fetch this from an API
      const mockUsers: User[] = [
        { _id: user.id, name: user.name, email: user.email, companyName: user.companyName },
        // Add more users as needed
      ];
      setUsers(mockUsers);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load users';
      setErrors(prev => ({ ...prev, users: message }));
      console.error('Error loading users:', error);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [user]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshAccounts(),
      refreshTransactions(),
      refreshOverview(),
      refreshUsers(),
    ]);
  }, [refreshAccounts, refreshTransactions, refreshOverview, refreshUsers]);

  // Account operations
  const createAccount = useCallback(async (accountData: Partial<BankAccount>) => {
    try {
      const response = await bankingService.createBankAccount(accountData);
      if (response.data) {
        setAccounts(prev => [response.data, ...prev]);
        await refreshOverview(); // Refresh overview to update totals
        addToast({
          title: 'Success',
          message: 'Bank account created successfully!',
          type: 'success',
          duration: 3000,
        });
        return response.data;
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to create account';
      addToast({
        title: 'Error',
        message: message,
        type: 'error',
        duration: 5000,
      });
      throw error;
    }
  }, [addToast, refreshOverview]);

  const updateAccount = useCallback(async (id: string, accountData: Partial<BankAccount>) => {
    try {
      const response = await bankingService.updateBankAccount(id, accountData);
      if (response.data) {
        setAccounts(prev => prev.map(account => 
          account._id === id ? response.data : account
        ));
        await refreshOverview(); // Refresh overview to update totals
        addToast({
          title: 'Success',
          message: 'Bank account updated successfully!',
          type: 'success',
          duration: 3000,
        });
        return response.data;
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update account';
      addToast({
        title: 'Error',
        message: message,
        type: 'error',
        duration: 5000,
      });
      throw error;
    }
  }, [addToast, refreshOverview]);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      await bankingService.deleteBankAccount(id);
      setAccounts(prev => prev.filter(account => account._id !== id));
      setTransactions(prev => prev.filter(transaction => transaction.accountId !== id));
      await refreshOverview(); // Refresh overview to update totals
      addToast({
        title: 'Success',
        message: 'Bank account deleted successfully!',
        type: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete account';
      addToast({
        title: 'Error',
        message: message,
        type: 'error',
        duration: 5000,
      });
      throw error;
    }
  }, [addToast, refreshOverview]);

  const syncAccount = useCallback(async (id: string) => {
    try {
      await bankingService.syncBankAccount(id);
      await refreshAccounts(); // Refresh accounts to get updated sync status
      await refreshTransactions(); // Refresh transactions in case new ones were imported
      addToast({
        title: 'Success',
        message: 'Bank account synced successfully!',
        type: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to sync account';
      addToast({
        title: 'Error',
        message: message,
        type: 'error',
        duration: 5000,
      });
      throw error;
    }
  }, [addToast, refreshAccounts, refreshTransactions]);

  // Transaction operations
  const createTransaction = useCallback(async (transactionData: Partial<BankTransaction>) => {
    try {
      const response = await bankingService.createTransaction(transactionData);
      if (response.data) {
        setTransactions(prev => [response.data, ...prev]);
        await refreshOverview(); // Refresh overview to update totals
        addToast({
          title: 'Success',
          message: 'Transaction created successfully!',
          type: 'success',
          duration: 3000,
        });
        return response.data;
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to create transaction';
      addToast({
        title: 'Error',
        message: message,
        type: 'error',
        duration: 5000,
      });
      throw error;
    }
  }, [addToast, refreshOverview]);

  const updateTransaction = useCallback(async (id: string, transactionData: Partial<BankTransaction>) => {
    try {
      const response = await bankingService.updateTransaction(id, transactionData);
      if (response.data) {
        setTransactions(prev => prev.map(transaction => 
          transaction._id === id ? response.data : transaction
        ));
        await refreshOverview(); // Refresh overview to update totals
        addToast({
          title: 'Success',
          message: 'Transaction updated successfully!',
          type: 'success',
          duration: 3000,
        });
        return response.data;
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update transaction';
      addToast({
        title: 'Error',
        message: message,
        type: 'error',
        duration: 5000,
      });
      throw error;
    }
  }, [addToast, refreshOverview]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Deleting transaction with ID:', id);
      console.log('🗑️ Current transactions before delete:', transactions.length);
      
      await bankingService.deleteTransaction(id);
      
      console.log('🗑️ API call successful, updating local state');
      setTransactions(prev => {
        const filtered = prev.filter(transaction => transaction._id !== id);
        console.log('🗑️ Transactions after filter:', filtered.length);
        return filtered;
      });
      
      await refreshOverview(); // Refresh overview to update totals
      
      console.log('🗑️ Delete operation completed successfully');
      addToast({
        title: 'Success',
        message: 'Transaction deleted successfully!',
        type: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('🗑️ Delete transaction error:', error);
      const message = error?.response?.data?.message || error?.message || 'Failed to delete transaction';
      addToast({
        title: 'Error',
        message: message,
        type: 'error',
        duration: 5000,
      });
      throw error;
    }
  }, [addToast, refreshOverview, transactions.length]);

  const reconcileTransaction = useCallback(async (id: string) => {
    try {
      const response = await bankingService.reconcileTransaction(id);
      if (response.data) {
        setTransactions(prev => prev.map(transaction => 
          transaction._id === id ? response.data : transaction
        ));
        addToast({
          title: 'Success',
          message: 'Transaction reconciled successfully!',
          type: 'success',
          duration: 3000,
        });
        return response.data;
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to reconcile transaction';
      addToast({
        title: 'Error',
        message: message,
        type: 'error',
        duration: 5000,
      });
      throw error;
    }
  }, [addToast]);

  // Load initial data when user changes
  useEffect(() => {
    if (user) {
      refreshAll();
    } else {
      // Clear data when user logs out
      setAccounts([]);
      setTransactions([]);
      setOverview(null);
      setUsers([]);
      setErrors({ accounts: null, transactions: null, overview: null, users: null });
    }
  }, [user, refreshAll]);

  const contextValue: BankingContextType = {
    // Data
    accounts,
    transactions,
    overview,
    users,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    
    // Actions
    refreshAccounts,
    refreshTransactions,
    refreshOverview,
    refreshUsers,
    refreshAll,
    
    // Account operations
    createAccount,
    updateAccount,
    deleteAccount,
    syncAccount,
    
    // Transaction operations
    createTransaction,
    updateTransaction,
    deleteTransaction,
    reconcileTransaction,
    
    // Utility functions
    getAccountById,
    getTransactionsByAccount,
    getUnreconciledTransactions,
  };

  return (
    <BankingContext.Provider value={contextValue}>
      {children}
    </BankingContext.Provider>
  );
};
