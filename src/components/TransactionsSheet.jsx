import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudget } from '../context/BudgetContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { utils, writeFile } from 'xlsx';
import { format } from 'date-fns';

const { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiAlertCircle, 
  FiFilter, 
  FiUpload, 
  FiDownload, 
  FiCalendar,
  FiCheckCircle,
  FiXCircle
} = FiIcons;

const TransactionsSheet = () => {
  const {
    transactions,
    categories,
    alertThreshold,
    currentFinancialYear,
    setCurrentFinancialYear,
    setAlertThreshold,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
    getAvailableFinancialYears,
    getTransactionsForFinancialYear
  } = useBudget();

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: '',
    type: 'Expense',
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);
  const availableYears = getAvailableFinancialYears();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, formData);
      setEditingTransaction(null);
    } else {
      addTransaction(formData);
    }
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: '',
      type: 'Expense',
    });
    setShowForm(false);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      date: new Date(transaction.date).toISOString().split('T')[0],
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category,
      type: transaction.type,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: '',
      type: 'Expense',
    });
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    if (e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await importTransactions(file);
      setImportResult(result);
      
      // Reset file input
      e.target.value = null;
    } catch (error) {
      setImportResult({ success: false, error: error.message });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Create template structure
    const template = [
      {
        Date: format(new Date(), 'yyyy-MM-dd'),
        Description: 'Example Transaction',
        Amount: 100.00,
        Category: 'Food',
        Type: 'Expense'
      },
      {
        Date: format(new Date(), 'yyyy-MM-dd'),
        Description: 'Example Income',
        Amount: 1000.00,
        Category: 'Salary',
        Type: 'Income'
      }
    ];
    
    // Create instructions sheet
    const instructions = [
      ['Budget Tracker Import Template'],
      [''],
      ['Instructions:'],
      ['1. Enter your transactions in the Transactions sheet'],
      ['2. Ensure all columns are filled correctly'],
      ['3. Dates should be in YYYY-MM-DD format'],
      ['4. Amount should be a number (no currency symbols)'],
      ['5. Type must be either "Income" or "Expense"'],
      ['6. Category should match one of your existing categories'],
      [''],
      ['Available Categories:'],
      [''],
    ];
    
    // Add category list
    const incomeCategories = categories.filter(c => c.type === 'Income').map(c => c.name);
    const expenseCategories = categories.filter(c => c.type === 'Expense').map(c => c.name);
    
    instructions.push(['Income Categories:']);
    incomeCategories.forEach(cat => instructions.push([cat]));
    instructions.push(['']);
    instructions.push(['Expense Categories:']);
    expenseCategories.forEach(cat => instructions.push([cat]));
    
    // Create workbook with both sheets
    const wb = utils.book_new();
    const transactionsSheet = utils.json_to_sheet(template);
    const instructionsSheet = utils.aoa_to_sheet(instructions);
    
    utils.book_append_sheet(wb, instructionsSheet, 'Instructions');
    utils.book_append_sheet(wb, transactionsSheet, 'Transactions');
    
    // Download file
    writeFile(wb, 'budget_tracker_import_template.xlsx');
  };

  const filteredTransactions = getTransactionsForFinancialYear(currentFinancialYear).filter(transaction => {
    const typeMatch = filterType === 'All' || transaction.type === filterType;
    const categoryMatch = filterCategory === 'All' || transaction.category === filterCategory;
    return typeMatch && categoryMatch;
  });

  const availableCategories = categories.filter(cat => 
    formData.type === 'All' || cat.type === formData.type
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
          
          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={handleImportClick}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiUpload} className="w-4 h-4" />
              <span>Import</span>
            </motion.button>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              className="hidden"
            />
            
            <motion.button
              onClick={downloadTemplate}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              <span>Template</span>
            </motion.button>
            
            <motion.button
              onClick={() => setShowForm(true)}
              className="bg-success-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-success-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span>Add Transaction</span>
            </motion.button>
          </div>
        </div>
        
        {/* Import Result Notification */}
        <AnimatePresence>
          {importResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                importResult.success 
                  ? 'bg-success-50 border border-success-200 text-success-800'
                  : 'bg-danger-50 border border-danger-200 text-danger-800'
              }`}
            >
              <SafeIcon 
                icon={importResult.success ? FiCheckCircle : FiXCircle} 
                className={`w-5 h-5 mt-0.5 ${importResult.success ? 'text-success-600' : 'text-danger-600'}`} 
              />
              <div>
                <h3 className="font-semibold">
                  {importResult.success ? 'Import Successful' : 'Import Failed'}
                </h3>
                <p>
                  {importResult.success 
                    ? `Successfully imported ${importResult.count} transactions.` 
                    : `Error: ${importResult.error}`
                  }
                </p>
              </div>
              <button 
                onClick={() => setImportResult(null)}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                <SafeIcon icon={FiXCircle} className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alert Threshold Setting */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-yellow-600 mr-2" />
              <label className="text-sm font-medium text-yellow-800">Alert Threshold:</label>
            </div>
            <input
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseFloat(e.target.value) || 0)}
              className="px-3 py-1 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter amount"
            />
            <span className="text-sm text-yellow-700">
              Transactions above this amount will be highlighted
            </span>
          </div>
        </div>

        {/* Financial Year and Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-600 mr-2" />
            <label className="text-sm font-medium text-gray-700">Financial Year:</label>
          </div>
          <select
            value={currentFinancialYear}
            onChange={(e) => setCurrentFinancialYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>FY {year}</option>
            ))}
          </select>
          
          <div className="flex items-center ml-4">
            <SafeIcon icon={FiFilter} className="w-5 h-5 text-gray-600 mr-2" />
            <label className="text-sm font-medium text-gray-700">Type:</label>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          
          <div className="flex items-center ml-4">
            <SafeIcon icon={FiFilter} className="w-5 h-5 text-gray-600 mr-2" />
            <label className="text-sm font-medium text-gray-700">Category:</label>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="All">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Transaction Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg border"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Transaction description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select Category</option>
                  {availableCategories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-5 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                    No transactions found for FY {currentFinancialYear}. Add your first transaction or adjust filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((transaction) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-gray-50 ${
                        transaction.amount > alertThreshold ? 'bg-yellow-50 border-yellow-300' : ''
                      }`}
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex items-center">
                          {transaction.amount > alertThreshold && (
                            <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-yellow-600 mr-2" />
                          )}
                          {transaction.description}
                        </div>
                      </td>
                      <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${
                        transaction.type === 'Income' ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {transaction.type === 'Income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{transaction.category}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          transaction.type === 'Income' 
                            ? 'bg-success-100 text-success-800' 
                            : 'bg-danger-100 text-danger-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-primary-600 hover:text-primary-800 transition-colors"
                            aria-label="Edit transaction"
                          >
                            <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="text-danger-600 hover:text-danger-800 transition-colors"
                            aria-label="Delete transaction"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsSheet;