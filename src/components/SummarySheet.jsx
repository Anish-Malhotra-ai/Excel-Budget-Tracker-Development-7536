import React from 'react';
import { motion } from 'framer-motion';
import { useBudget } from '../context/BudgetContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';
// Import html2pdf correctly
import html2pdf from 'html2pdf.js';

const { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign, 
  FiPieChart, 
  FiDownload,
  FiCalendar,
  FiTarget,
  FiActivity
} = FiIcons;

const SummarySheet = () => {
  const { 
    currentFinancialYear,
    setCurrentFinancialYear,
    getTotalIncome, 
    getTotalExpenses, 
    getNetPosition,
    getAvailableFinancialYears,
    getCategoryBudgetData
  } = useBudget();

  const totalIncome = getTotalIncome(currentFinancialYear);
  const totalExpenses = getTotalExpenses(currentFinancialYear);
  const netPosition = getNetPosition(currentFinancialYear);
  const categoryBudgetData = getCategoryBudgetData();
  const availableYears = getAvailableFinancialYears();

  // Sort categories by budget vs. actual
  const incomeCategories = Object.entries(categoryBudgetData)
    .filter(([, data]) => data.type === 'Income')
    .sort(([, a], [, b]) => b.actual - a.actual);

  const expenseCategories = Object.entries(categoryBudgetData)
    .filter(([, data]) => data.type === 'Expense')
    .sort(([, a], [, b]) => b.actual - a.actual);

  const summaryCards = [
    {
      title: 'Total Income',
      value: totalIncome,
      icon: FiTrendingUp,
      color: 'success',
      prefix: '+$',
    },
    {
      title: 'Total Expenses',
      value: totalExpenses,
      icon: FiTrendingDown,
      color: 'danger',
      prefix: '-$',
    },
    {
      title: 'Net Position',
      value: netPosition,
      icon: FiDollarSign,
      color: netPosition >= 0 ? 'success' : 'danger',
      prefix: netPosition >= 0 ? '+$' : '-$',
    },
    {
      title: 'Budget Utilization',
      value: totalExpenses > 0 ? (totalExpenses / totalIncome) * 100 : 0,
      icon: FiPieChart,
      color: 'primary',
      suffix: '%',
    },
  ];

  const exportAsPDF = () => {
    const element = document.getElementById('summary-report');
    const today = format(new Date(), 'yyyy-MM-dd');
    const filename = `budget-summary-${currentFinancialYear}-${today}.pdf`;
    
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Add report generation date and financial year
    const reportHeader = document.createElement('div');
    reportHeader.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0284c7; font-size: 24px; margin-bottom: 5px;">Budget Summary Report</h1>
        <p style="font-size: 14px; color: #64748b;">
          Financial Year: ${currentFinancialYear} | Generated on: ${today}
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
      <div className="bg-white rounded-lg shadow-md p-6" id="summary-report">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Financial Summary</h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-600" />
              <select
                value={currentFinancialYear}
                onChange={(e) => setCurrentFinancialYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>FY {year}</option>
                ))}
              </select>
            </div>
            
            <motion.button
              onClick={exportAsPDF}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              <span>Export PDF</span>
            </motion.button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-r from-${card.color}-500 to-${card.color}-600 rounded-lg p-6 text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{card.title}</p>
                  <p className="text-2xl font-bold">
                    {card.prefix || ''}{Math.abs(card.value).toFixed(card.title === 'Budget Utilization' ? 1 : 2)}{card.suffix || ''}
                  </p>
                </div>
                <SafeIcon icon={card.icon} className="w-8 h-8 opacity-80" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Budget vs Actual Expense Categories */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <SafeIcon icon={FiActivity} className="w-5 h-5 mr-2" />
            Expense Budget Tracking
          </h3>
          
          {expenseCategories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No expense transactions in the current financial year.
            </p>
          ) : (
            <div className="space-y-4">
              {expenseCategories.map(([category, data], index) => {
                const percentage = data.budget > 0 ? (data.actual / data.budget) * 100 : 0;
                const isOverBudget = percentage > 100;
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">{category}</span>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-danger-600">${data.actual.toFixed(2)}</span>
                          <span className="mx-1 text-gray-400">of</span>
                          <span className="font-medium text-gray-600">${data.budget.toFixed(2)}</span>
                        </div>
                        <span className={`text-xs font-medium ${isOverBudget ? 'text-danger-600' : 'text-success-600'}`}>
                          {isOverBudget ? 'Over budget' : 'Under budget'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                        className={`h-2.5 rounded-full ${
                          percentage > 90 ? 'bg-danger-500' : 
                          percentage > 75 ? 'bg-yellow-500' : 
                          'bg-success-500'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                      <span>{percentage.toFixed(1)}% used</span>
                      <span className={data.remaining < 0 ? 'text-danger-600 font-medium' : ''}>
                        ${data.remaining.toFixed(2)} remaining
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Income Target Tracking */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <SafeIcon icon={FiTarget} className="w-5 h-5 mr-2" />
            Income Target Tracking
          </h3>
          
          {incomeCategories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No income transactions in the current financial year.
            </p>
          ) : (
            <div className="space-y-4">
              {incomeCategories.map(([category, data], index) => {
                const percentage = data.budget > 0 ? (data.actual / data.budget) * 100 : 0;
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">{category}</span>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-success-600">${data.actual.toFixed(2)}</span>
                          <span className="mx-1 text-gray-400">of</span>
                          <span className="font-medium text-gray-600">${data.budget.toFixed(2)}</span>
                        </div>
                        <span className={`text-xs font-medium ${percentage >= 100 ? 'text-success-600' : 'text-primary-600'}`}>
                          {percentage >= 100 ? 'Target reached' : 'Target in progress'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                        className={`h-2.5 rounded-full ${
                          percentage >= 100 ? 'bg-success-500' : 
                          percentage >= 75 ? 'bg-primary-500' : 
                          'bg-primary-300'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                      <span>{percentage.toFixed(1)}% of target</span>
                      <span>${data.remaining.toFixed(2)} {percentage >= 100 ? 'above target' : 'to target'}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <SafeIcon icon={FiDollarSign} className="w-4 h-4 mr-1 text-primary-600" />
              Income vs Budget
            </h4>
            <p className="text-2xl font-bold text-primary-600">
              {totalIncome > 0 && Object.values(categoryBudgetData)
                .filter(data => data.type === 'Income')
                .reduce((sum, data) => sum + data.budget, 0) > 0 ? 
                ((totalIncome / Object.values(categoryBudgetData)
                  .filter(data => data.type === 'Income')
                  .reduce((sum, data) => sum + data.budget, 0)) * 100).toFixed(1) : '0.0'}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              of income targets achieved
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <SafeIcon icon={FiDollarSign} className="w-4 h-4 mr-1 text-danger-600" />
              Expense vs Budget
            </h4>
            <p className="text-2xl font-bold text-danger-600">
              {totalExpenses > 0 && Object.values(categoryBudgetData)
                .filter(data => data.type === 'Expense')
                .reduce((sum, data) => sum + data.budget, 0) > 0 ? 
                ((totalExpenses / Object.values(categoryBudgetData)
                  .filter(data => data.type === 'Expense')
                  .reduce((sum, data) => sum + data.budget, 0)) * 100).toFixed(1) : '0.0'}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              of expense budget utilized
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <SafeIcon icon={FiTarget} className="w-4 h-4 mr-1 text-success-600" />
              Savings Rate
            </h4>
            <p className="text-2xl font-bold text-success-600">
              {totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : '0.0'}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              of income saved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarySheet;