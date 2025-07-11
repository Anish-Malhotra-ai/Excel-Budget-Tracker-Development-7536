import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBudget } from '../context/BudgetContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';
// Import html2pdf correctly
import html2pdf from 'html2pdf.js';

const { 
  FiCalendar, 
  FiFilter, 
  FiDownload, 
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiDollarSign
} = FiIcons;

const ReportsSheet = () => {
  const { 
    categories, 
    currentFinancialYear,
    setCurrentFinancialYear,
    getMonthlyData,
    getAvailableFinancialYears,
    getTransactionsForFinancialYear,
    getCategoryBudgetData
  } = useBudget();
  
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const availableYears = getAvailableFinancialYears();
  const fyTransactions = getTransactionsForFinancialYear(currentFinancialYear);
  const categoryBudgetData = getCategoryBudgetData();

  // Get available months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set();
    fyTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  }, [fyTransactions]);

  // Filter transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    return fyTransactions.filter(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthMatch = selectedMonth === 'all' || monthKey === selectedMonth;
      const categoryMatch = selectedCategory === 'all' || transaction.category === selectedCategory;
      const typeMatch = selectedType === 'all' || transaction.type === selectedType;
      
      return monthMatch && categoryMatch && typeMatch;
    });
  }, [fyTransactions, selectedMonth, selectedCategory, selectedType]);

  // Generate pivot table data
  const pivotData = useMemo(() => {
    const data = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!data[monthKey]) {
        data[monthKey] = {
          month: monthName,
          categories: {},
          totalIncome: 0,
          totalExpenses: 0,
        };
      }
      
      if (!data[monthKey].categories[transaction.category]) {
        data[monthKey].categories[transaction.category] = {
          income: 0,
          expenses: 0,
          total: 0,
        };
      }
      
      if (transaction.type === 'Income') {
        data[monthKey].categories[transaction.category].income += transaction.amount;
        data[monthKey].totalIncome += transaction.amount;
      } else {
        data[monthKey].categories[transaction.category].expenses += transaction.amount;
        data[monthKey].totalExpenses += transaction.amount;
      }
      
      data[monthKey].categories[transaction.category].total += transaction.amount;
    });
    
    return Object.values(data).sort((a, b) => b.month.localeCompare(a.month));
  }, [filteredTransactions]);

  // Category summary
  const categoryData = useMemo(() => {
    const data = {};
    
    filteredTransactions.forEach(transaction => {
      if (!data[transaction.category]) {
        // Get budget info for this category
        const budgetInfo = categoryBudgetData[transaction.category] || {
          type: transaction.type,
          budget: 0
        };
        
        data[transaction.category] = {
          category: transaction.category,
          type: transaction.type,
          income: 0,
          expenses: 0,
          total: 0,
          count: 0,
          budget: budgetInfo.budget || 0
        };
      }
      
      if (transaction.type === 'Income') {
        data[transaction.category].income += transaction.amount;
      } else {
        data[transaction.category].expenses += transaction.amount;
      }
      
      data[transaction.category].total += transaction.amount;
      data[transaction.category].count += 1;
    });
    
    // Calculate budget variance and percentage
    Object.values(data).forEach(item => {
      if (item.type === 'Expense') {
        item.variance = item.budget - item.expenses;
        item.percentage = item.budget > 0 ? (item.expenses / item.budget) * 100 : 0;
      } else {
        item.variance = item.income - item.budget;
        item.percentage = item.budget > 0 ? (item.income / item.budget) * 100 : 0;
      }
    });
    
    return Object.values(data).sort((a, b) => b.total - a.total);
  }, [filteredTransactions, categoryBudgetData]);

  const exportToCSV = () => {
    // Build report title with date range and filters
    const today = format(new Date(), 'yyyy-MM-dd');
    let reportTitle = `Budget Report - FY ${currentFinancialYear}`;
    
    if (selectedMonth !== 'all') {
      const monthDate = new Date(selectedMonth + '-01');
      reportTitle += ` - ${monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`;
    }
    
    if (selectedCategory !== 'all') {
      reportTitle += ` - Category: ${selectedCategory}`;
    }
    
    if (selectedType !== 'all') {
      reportTitle += ` - Type: ${selectedType}`;
    }
    
    // CSV header row with metadata
    const csvData = [
      [reportTitle],
      [`Generated on: ${today}`],
      [''],
      ['Date', 'Description', 'Amount', 'Category', 'Type', 'Budget', 'Variance']
    ];
    
    // Add transaction data with budget information
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach(t => {
        const categoryInfo = categoryBudgetData[t.category] || { budget: 0 };
        let budget = 0;
        let variance = 0;
        
        // Calculate per-transaction budget allocation (simplified approach)
        if (t.type === 'Expense') {
          budget = categoryInfo.budget;
          variance = budget > 0 ? budget - categoryInfo.actual : 0;
        } else {
          budget = categoryInfo.budget;
          variance = categoryInfo.actual - budget;
        }
        
        csvData.push([
          new Date(t.date).toLocaleDateString(),
          t.description,
          t.amount.toFixed(2),
          t.category,
          t.type,
          budget.toFixed(2),
          variance.toFixed(2)
        ]);
      });
    
    // Add summary section
    csvData.push(['']);
    csvData.push(['Summary']);
    csvData.push(['Category', 'Type', 'Income', 'Expenses', 'Budget', 'Variance', 'Utilization %']);
    
    categoryData.forEach(cat => {
      csvData.push([
        cat.category,
        cat.type,
        cat.income.toFixed(2),
        cat.expenses.toFixed(2),
        cat.budget.toFixed(2),
        cat.variance.toFixed(2),
        cat.percentage.toFixed(1) + '%'
      ]);
    });
    
    // Create and download CSV
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-report-${currentFinancialYear}-${today}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const element = document.getElementById('detailed-report');
    const today = format(new Date(), 'yyyy-MM-dd');
    
    let reportTitle = `Budget Report - FY ${currentFinancialYear}`;
    if (selectedMonth !== 'all') {
      const monthDate = new Date(selectedMonth + '-01');
      reportTitle += ` - ${monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`;
    }
    if (selectedCategory !== 'all') reportTitle += ` - ${selectedCategory}`;
    if (selectedType !== 'all') reportTitle += ` - ${selectedType}`;
    
    const filename = `budget-report-${currentFinancialYear}-${today}.pdf`;
    
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Add report header with date and filters
    const reportHeader = document.createElement('div');
    reportHeader.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0284c7; font-size: 24px; margin-bottom: 5px;">${reportTitle}</h1>
        <p style="font-size: 14px; color: #64748b;">
          Generated on: ${today}
        </p>
      </div>
    `;
    element.prepend(reportHeader);
    
    html2pdf().set(opt).from(element).save().then(() => {
      // Remove the temporary header after PDF generation
      element.removeChild(reportHeader);
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6" id="detailed-report">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Financial Reports</h2>
          
          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={exportToCSV}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              <span>Export CSV</span>
            </motion.button>
            
            <motion.button
              onClick={exportToPDF}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiFileText} className="w-4 h-4" />
              <span>Export PDF</span>
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiCalendar} className="w-4 h-4 inline mr-1" />
              Financial Year
            </label>
            <select
              value={currentFinancialYear}
              onChange={(e) => setCurrentFinancialYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>FY {year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiCalendar} className="w-4 h-4 inline mr-1" />
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Months</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiFilter} className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-success-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-success-800">Total Income</h3>
            <p className="text-2xl font-bold text-success-600">
              ${filteredTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-danger-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-danger-800">Total Expenses</h3>
            <p className="text-2xl font-bold text-danger-600">
              ${filteredTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-primary-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-primary-800">Net Position</h3>
            <p className="text-2xl font-bold text-primary-600">
              ${(filteredTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0) - 
                 filteredTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0)).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Category Analysis Table with Budget */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <SafeIcon icon={FiDollarSign} className="w-5 h-5 mr-2" />
            Category Analysis with Budget
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Income</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Expenses</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Budget</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Variance</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      No data available for the selected filters
                    </td>
                  </tr>
                ) : (
                  categoryData.map((category) => {
                    const isExpense = category.type === 'Expense';
                    const isOverBudget = isExpense ? category.expenses > category.budget && category.budget > 0 : false;
                    const isUnderTarget = !isExpense ? category.income < category.budget && category.budget > 0 : false;
                    const isOnTrack = !isOverBudget && !isUnderTarget;
                    
                    return (
                      <motion.tr
                        key={category.category}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {category.category}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            category.type === 'Income' 
                              ? 'bg-success-100 text-success-800' 
                              : 'bg-danger-100 text-danger-800'
                          }`}>
                            {category.type}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-success-600">
                          ${category.income.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-danger-600">
                          ${category.expenses.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                          ${category.budget.toFixed(2)}
                        </td>
                        <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${
                          isExpense 
                            ? category.variance < 0 ? 'text-danger-600' : 'text-success-600'
                            : category.variance < 0 ? 'text-danger-600' : 'text-success-600'
                        }`}>
                          ${Math.abs(category.variance).toFixed(2)}
                          {category.budget > 0 && (
                            <span className="text-xs ml-1">
                              {isExpense
                                ? category.variance < 0 ? '(over)' : '(under)'
                                : category.variance < 0 ? '(below)' : '(above)'}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {category.budget > 0 ? (
                            <div className="flex justify-center items-center">
                              <SafeIcon 
                                icon={isOnTrack ? FiCheckCircle : FiAlertCircle} 
                                className={`w-4 h-4 mr-1 ${isOnTrack ? 'text-success-600' : 'text-danger-600'}`} 
                              />
                              <span className="text-xs font-medium">
                                {isExpense
                                  ? isOverBudget ? 'Over Budget' : 'Under Budget'
                                  : isUnderTarget ? 'Below Target' : 'On Target'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No budget set</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {category.count}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Pivot Table */}
        {selectedMonth === 'all' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Breakdown</h3>
            <div className="space-y-4">
              {pivotData.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data available</p>
              ) : (
                pivotData.map((monthData) => (
                  <motion.div
                    key={monthData.month}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">{monthData.month}</h4>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-success-600 font-medium">
                          Income: ${monthData.totalIncome.toFixed(2)}
                        </span>
                        <span className="text-danger-600 font-medium">
                          Expenses: ${monthData.totalExpenses.toFixed(2)}
                        </span>
                        <span className="text-primary-600 font-medium">
                          Net: ${(monthData.totalIncome - monthData.totalExpenses).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {Object.entries(monthData.categories).map(([category, data]) => (
                        <div key={category} className="bg-white rounded p-3 border border-gray-200">
                          <div className="font-medium text-gray-800 mb-1">{category}</div>
                          <div className="text-sm text-gray-600">
                            {data.income > 0 && <span className="text-success-600">+${data.income.toFixed(2)}</span>}
                            {data.income > 0 && data.expenses > 0 && <span className="mx-1">|</span>}
                            {data.expenses > 0 && <span className="text-danger-600">-${data.expenses.toFixed(2)}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsSheet;