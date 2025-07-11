import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { useBudget } from '../context/BudgetContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';
// Import html2pdf correctly
import html2pdf from 'html2pdf.js';

const { FiDownload, FiCalendar } = FiIcons;

const ChartsSheet = () => {
  const { 
    currentFinancialYear,
    setCurrentFinancialYear, 
    getMonthlyData,
    getAvailableFinancialYears,
    getCategoryBudgetData
  } = useBudget();
  
  const availableYears = getAvailableFinancialYears();
  const categoryBudgetData = getCategoryBudgetData();

  // Monthly Income vs Expenses Line Chart
  const monthlyChartOptions = useMemo(() => {
    const monthlyData = getMonthlyData(currentFinancialYear);
    const months = Object.keys(monthlyData).sort();
    const incomeData = months.map(month => monthlyData[month].income);
    const expenseData = months.map(month => monthlyData[month].expenses);
    const netData = months.map(month => monthlyData[month].income - monthlyData[month].expenses);

    return {
      title: {
        text: 'Income vs Expenses Over Time',
        left: 'center',
        textStyle: { fontSize: 18, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const month = params[0].axisValue;
          let tooltip = `<strong>${month}</strong><br/>`;
          params.forEach(param => {
            tooltip += `${param.marker} ${param.seriesName}: $${param.value.toFixed(2)}<br/>`;
          });
          return tooltip;
        }
      },
      legend: {
        data: ['Income', 'Expenses', 'Net'],
        bottom: 10
      },
      xAxis: {
        type: 'category',
        data: months.map(month => {
          const date = new Date(month + '-01');
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        })
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '${value}'
        }
      },
      series: [
        {
          name: 'Income',
          type: 'line',
          data: incomeData,
          smooth: true,
          lineStyle: { color: '#22c55e', width: 3 },
          itemStyle: { color: '#22c55e' },
          areaStyle: { color: 'rgba(34, 197, 94, 0.1)' }
        },
        {
          name: 'Expenses',
          type: 'line',
          data: expenseData,
          smooth: true,
          lineStyle: { color: '#ef4444', width: 3 },
          itemStyle: { color: '#ef4444' },
          areaStyle: { color: 'rgba(239, 68, 68, 0.1)' }
        },
        {
          name: 'Net',
          type: 'line',
          data: netData,
          smooth: true,
          lineStyle: { color: '#0ea5e9', width: 3 },
          itemStyle: { color: '#0ea5e9' }
        }
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      }
    };
  }, [getMonthlyData, currentFinancialYear]);

  // Expense Category Pie Chart
  const expensePieOptions = useMemo(() => {
    const expenseCategories = Object.entries(categoryBudgetData)
      .filter(([, data]) => data.type === 'Expense' && data.actual > 0);
    
    const pieData = expenseCategories
      .map(([category, data]) => ({
        name: category,
        value: data.actual
      }))
      .sort((a, b) => b.value - a.value);

    return {
      title: {
        text: 'Expense Categories Breakdown',
        left: 'center',
        textStyle: { fontSize: 18, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ${c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle'
      },
      series: [
        {
          name: 'Expenses',
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['60%', '50%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{b}\n${c}'
          }
        }
      ]
    };
  }, [categoryBudgetData]);

  // Income Category Pie Chart
  const incomePieOptions = useMemo(() => {
    const incomeCategories = Object.entries(categoryBudgetData)
      .filter(([, data]) => data.type === 'Income' && data.actual > 0);
    
    const pieData = incomeCategories
      .map(([category, data]) => ({
        name: category,
        value: data.actual
      }))
      .sort((a, b) => b.value - a.value);

    return {
      title: {
        text: 'Income Sources Breakdown',
        left: 'center',
        textStyle: { fontSize: 18, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ${c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle'
      },
      series: [
        {
          name: 'Income',
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['60%', '50%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{b}\n${c}'
          },
          color: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d']
        }
      ]
    };
  }, [categoryBudgetData]);

  // Budget vs Actual Bar Chart
  const budgetBarOptions = useMemo(() => {
    const expenseCategories = Object.entries(categoryBudgetData)
      .filter(([, data]) => data.type === 'Expense')
      .sort((a, b) => b[1].budget - a[1].budget);
    
    const categories = expenseCategories.map(([category]) => category);
    const budgetData = expenseCategories.map(([, data]) => data.budget);
    const actualData = expenseCategories.map(([, data]) => data.actual);

    return {
      title: {
        text: 'Budget vs Actual Expenses',
        left: 'center',
        textStyle: { fontSize: 18, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          let tooltip = `<strong>${params[0].name}</strong><br/>`;
          params.forEach(param => {
            tooltip += `${param.marker} ${param.seriesName}: $${param.value.toFixed(2)}<br/>`;
          });
          
          // Add variance calculation
          if (params.length > 1) {
            const budget = params.find(p => p.seriesName === 'Budget')?.value || 0;
            const actual = params.find(p => p.seriesName === 'Actual')?.value || 0;
            const variance = budget - actual;
            const varPercent = budget > 0 ? (variance / budget) * 100 : 0;
            
            tooltip += `<br/>Variance: $${variance.toFixed(2)} (${Math.abs(varPercent).toFixed(1)}% ${variance >= 0 ? 'under' : 'over'} budget)`;
          }
          
          return tooltip;
        }
      },
      legend: {
        data: ['Budget', 'Actual'],
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: '${value}'
        }
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          width: 100,
          overflow: 'truncate'
        }
      },
      series: [
        {
          name: 'Budget',
          type: 'bar',
          data: budgetData,
          itemStyle: { color: '#0ea5e9' }
        },
        {
          name: 'Actual',
          type: 'bar',
          data: actualData,
          itemStyle: function(params) {
            const budget = budgetData[params.dataIndex] || 0;
            const actual = actualData[params.dataIndex] || 0;
            
            // Color based on budget status
            return {
              color: actual > budget ? '#ef4444' : '#22c55e'
            };
          }
        }
      ]
    };
  }, [categoryBudgetData]);

  // Monthly Income vs Expense Bar Chart
  const monthlyBarOptions = useMemo(() => {
    const monthlyData = getMonthlyData(currentFinancialYear);
    const months = Object.keys(monthlyData).sort().slice(-6); // Last 6 months
    const incomeData = months.map(month => monthlyData[month].income);
    const expenseData = months.map(month => monthlyData[month].expenses);

    return {
      title: {
        text: 'Monthly Income vs Expenses (Last 6 Months)',
        left: 'center',
        textStyle: { fontSize: 18, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          const month = params[0].axisValue;
          let tooltip = `<strong>${month}</strong><br/>`;
          params.forEach(param => {
            tooltip += `${param.marker} ${param.seriesName}: $${param.value.toFixed(2)}<br/>`;
          });
          
          // Add net calculation
          if (params.length > 1) {
            const income = params.find(p => p.seriesName === 'Income')?.value || 0;
            const expenses = params.find(p => p.seriesName === 'Expenses')?.value || 0;
            const net = income - expenses;
            
            tooltip += `<br/>Net: $${net.toFixed(2)} (${net >= 0 ? 'Surplus' : 'Deficit'})`;
          }
          
          return tooltip;
        }
      },
      legend: {
        data: ['Income', 'Expenses'],
        bottom: 10
      },
      xAxis: {
        type: 'category',
        data: months.map(month => {
          const date = new Date(month + '-01');
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        })
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '${value}'
        }
      },
      series: [
        {
          name: 'Income',
          type: 'bar',
          data: incomeData,
          itemStyle: { color: '#22c55e' },
          barWidth: '40%'
        },
        {
          name: 'Expenses',
          type: 'bar',
          data: expenseData,
          itemStyle: { color: '#ef4444' },
          barWidth: '40%'
        }
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      }
    };
  }, [getMonthlyData, currentFinancialYear]);

  const exportChartsToPDF = () => {
    const element = document.getElementById('charts-report');
    const today = format(new Date(), 'yyyy-MM-dd');
    const filename = `budget-charts-${currentFinancialYear}-${today}.pdf`;
    
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Add report header with date and financial year
    const reportHeader = document.createElement('div');
    reportHeader.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0284c7; font-size: 24px; margin-bottom: 5px;">Financial Charts Report</h1>
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

  const hasData = Object.keys(getMonthlyData(currentFinancialYear)).length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6" id="charts-report">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Financial Charts</h2>
          
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
              onClick={exportChartsToPDF}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!hasData}
            >
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              <span>Export PDF</span>
            </motion.button>
          </div>
        </div>

        {!hasData ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No data available for FY {currentFinancialYear}.</p>
            <p className="text-gray-400 mt-2">Add some transactions to see visual insights.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Monthly Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <ReactECharts
                option={monthlyChartOptions}
                style={{ height: '400px' }}
                className="w-full"
              />
            </motion.div>

            {/* Budget vs Actual Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <ReactECharts
                option={budgetBarOptions}
                style={{ height: '500px' }}
                className="w-full"
              />
            </motion.div>

            {/* Pie Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <ReactECharts
                  option={expensePieOptions}
                  style={{ height: '400px' }}
                  className="w-full"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <ReactECharts
                  option={incomePieOptions}
                  style={{ height: '400px' }}
                  className="w-full"
                />
              </motion.div>
            </div>

            {/* Monthly Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <ReactECharts
                option={monthlyBarOptions}
                style={{ height: '400px' }}
                className="w-full"
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsSheet;