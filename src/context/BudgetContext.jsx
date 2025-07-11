import React, { createContext, useContext, useState, useEffect } from 'react';
import { read, utils } from 'xlsx';

const BudgetContext = createContext();

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

const defaultCategories = [
  { id: 1, name: 'Salary', type: 'Income', budget: 5000 },
  { id: 2, name: 'Freelance', type: 'Income', budget: 1000 },
  { id: 3, name: 'Investments', type: 'Income', budget: 500 },
  { id: 4, name: 'Other Income', type: 'Income', budget: 200 },
  { id: 5, name: 'Housing', type: 'Expense', budget: 1200 },
  { id: 6, name: 'Transportation', type: 'Expense', budget: 400 },
  { id: 7, name: 'Food', type: 'Expense', budget: 600 },
  { id: 8, name: 'Utilities', type: 'Expense', budget: 300 },
  { id: 9, name: 'Entertainment', type: 'Expense', budget: 200 },
  { id: 10, name: 'Healthcare', type: 'Expense', budget: 150 },
  { id: 11, name: 'Shopping', type: 'Expense', budget: 300 },
  { id: 12, name: 'Other Expenses', type: 'Expense', budget: 250 },
];

export const BudgetProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [alertThreshold, setAlertThreshold] = useState(500);
  const [currentFinancialYear, setCurrentFinancialYear] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // If we're in the second half of the calendar year (July-Dec), FY is current year to next year
    // Otherwise (Jan-June), FY is previous year to current year
    return month >= 6 
      ? `${year}-${year + 1}` 
      : `${year - 1}-${year}`;
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('budgetTracker_transactions');
    const savedCategories = localStorage.getItem('budgetTracker_categories');
    const savedThreshold = localStorage.getItem('budgetTracker_threshold');
    const savedFinancialYear = localStorage.getItem('budgetTracker_financialYear');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    if (savedThreshold) {
      setAlertThreshold(parseFloat(savedThreshold));
    }
    if (savedFinancialYear) {
      setCurrentFinancialYear(savedFinancialYear);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('budgetTracker_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_threshold', alertThreshold.toString());
  }, [alertThreshold]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_financialYear', currentFinancialYear);
  }, [currentFinancialYear]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      date: new Date(transaction.date).toISOString(),
      amount: parseFloat(transaction.amount),
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const updateTransaction = (id, updatedTransaction) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id 
          ? { ...transaction, ...updatedTransaction, amount: parseFloat(updatedTransaction.amount) }
          : transaction
      )
    );
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: Date.now(),
      budget: parseFloat(category.budget) || 0,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id, updatedCategory) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === id 
          ? { 
              ...category, 
              ...updatedCategory, 
              budget: parseFloat(updatedCategory.budget) || 0 
            }
          : category
      )
    );
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  const importTransactions = async (file) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);
      
      const newTransactions = jsonData.map(row => ({
        id: Date.now() + Math.floor(Math.random() * 1000),
        date: new Date(row.Date).toISOString(),
        description: row.Description,
        amount: parseFloat(row.Amount),
        category: row.Category,
        type: row.Type,
      }));
      
      setTransactions(prev => [...prev, ...newTransactions]);
      return { success: true, count: newTransactions.length };
    } catch (error) {
      console.error("Import error:", error);
      return { success: false, error: error.message };
    }
  };

  const getAvailableFinancialYears = () => {
    if (transactions.length === 0) {
      const currentYear = new Date().getFullYear();
      return [`${currentYear-1}-${currentYear}`, `${currentYear}-${currentYear+1}`];
    }
    
    const years = new Set();
    const currentYear = new Date().getFullYear();
    
    // Add current and next year by default
    years.add(`${currentYear-1}-${currentYear}`);
    years.add(`${currentYear}-${currentYear+1}`);
    
    // Add years from transactions
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      if (month >= 6) { // July-Dec
        years.add(`${year}-${year+1}`);
      } else { // Jan-June
        years.add(`${year-1}-${year}`);
      }
    });
    
    return Array.from(years).sort();
  };

  const getTransactionsForFinancialYear = (fy) => {
    if (!fy) fy = currentFinancialYear;
    
    const [startYear, endYear] = fy.split('-').map(Number);
    const startDate = new Date(startYear, 6, 1); // July 1st of start year
    const endDate = new Date(endYear, 5, 30); // June 30th of end year
    
    return transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return date >= startDate && date <= endDate;
    });
  };

  const getTotalIncome = (fy) => {
    const filteredTransactions = fy ? getTransactionsForFinancialYear(fy) : transactions;
    return filteredTransactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = (fy) => {
    const filteredTransactions = fy ? getTransactionsForFinancialYear(fy) : transactions;
    return filteredTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getNetPosition = (fy) => {
    return getTotalIncome(fy) - getTotalExpenses(fy);
  };

  const getTransactionsByCategory = (fy) => {
    const filteredTransactions = fy ? getTransactionsForFinancialYear(fy) : transactions;
    const result = {};
    filteredTransactions.forEach(transaction => {
      if (!result[transaction.category]) {
        result[transaction.category] = [];
      }
      result[transaction.category].push(transaction);
    });
    return result;
  };

  const getMonthlyData = (fy) => {
    const filteredTransactions = fy ? getTransactionsForFinancialYear(fy) : transactions;
    const monthlyData = {};
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'Income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    });
    return monthlyData;
  };

  const getCategoryBudgetData = () => {
    const categorySpending = {};
    
    // Initialize categories with budget and zero actual
    categories.forEach(category => {
      categorySpending[category.name] = {
        type: category.type,
        budget: category.budget || 0,
        actual: 0,
        remaining: category.budget || 0,
        transactions: []
      };
    });
    
    // Calculate actual spending for the current financial year
    const fyTransactions = getTransactionsForFinancialYear(currentFinancialYear);
    fyTransactions.forEach(transaction => {
      if (categorySpending[transaction.category]) {
        categorySpending[transaction.category].actual += transaction.amount;
        categorySpending[transaction.category].transactions.push(transaction);
      }
    });
    
    // Calculate remaining budget and percentages
    Object.keys(categorySpending).forEach(category => {
      const data = categorySpending[category];
      data.remaining = data.type === 'Expense' 
        ? data.budget - data.actual 
        : data.actual - data.budget;
      
      data.percentage = data.budget > 0 
        ? (data.actual / data.budget) * 100 
        : 0;
    });
    
    return categorySpending;
  };

  const value = {
    transactions,
    categories,
    alertThreshold,
    currentFinancialYear,
    setCurrentFinancialYear,
    setAlertThreshold,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    importTransactions,
    getTotalIncome,
    getTotalExpenses,
    getNetPosition,
    getTransactionsByCategory,
    getMonthlyData,
    getAvailableFinancialYears,
    getTransactionsForFinancialYear,
    getCategoryBudgetData,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};