import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiBook, 
  FiChevronDown, 
  FiChevronRight, 
  FiList, 
  FiTag, 
  FiBarChart3, 
  FiPieChart, 
  FiTrendingUp,
  FiAlertTriangle,
  FiDownload,
  FiFilter
} = FiIcons;

const UserGuide = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const guideContent = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: FiBook,
      content: [
        {
          title: 'Welcome to Your Budget Tracker',
          description: 'This comprehensive budget tracker helps you manage your personal finances with ease. Track income, expenses, and gain insights into your spending patterns.',
        },
        {
          title: 'Quick Start Guide',
          description: 'Follow these steps to get started:',
          steps: [
            'Navigate to the Transactions sheet to add your first transaction',
            'Customize categories in the Categories sheet to match your needs',
            'View your financial summary in the Summary sheet',
            'Analyze spending patterns in the Reports sheet',
            'Visualize your data with interactive charts'
          ]
        }
      ]
    },
    {
      id: 'transactions',
      title: 'Managing Transactions',
      icon: FiList,
      content: [
        {
          title: 'Adding Transactions',
          description: 'Click the "Add Transaction" button to record new income or expenses. Fill in all required fields:',
          steps: [
            'Date: Select the transaction date',
            'Description: Enter a clear description',
            'Amount: Input the transaction amount',
            'Type: Choose Income or Expense',
            'Category: Select from your custom categories'
          ]
        },
        {
          title: 'Data Validation',
          description: 'The system includes built-in validation to ensure data integrity:',
          steps: [
            'Categories are automatically filtered based on transaction type',
            'Amount fields only accept numeric values',
            'All fields are required for complete records'
          ]
        },
        {
          title: 'Alert Threshold',
          description: 'Set an alert threshold to highlight large transactions. Any transaction exceeding this amount will be highlighted with a warning icon.',
        },
        {
          title: 'Filtering and Sorting',
          description: 'Use the filter options to view specific types of transactions:',
          steps: [
            'Filter by transaction type (Income/Expense)',
            'Filter by category',
            'Transactions are automatically sorted by date (newest first)'
          ]
        }
      ]
    },
    {
      id: 'categories',
      title: 'Managing Categories',
      icon: FiTag,
      content: [
        {
          title: 'Category Organization',
          description: 'Categories are organized into two types: Income and Expense. This helps maintain clear financial tracking.',
        },
        {
          title: 'Default Categories',
          description: 'The system comes with pre-configured categories:',
          steps: [
            'Income: Salary, Freelance, Investments, Other Income',
            'Expense: Housing, Transportation, Food, Utilities, Entertainment, Healthcare, Shopping, Other Expenses'
          ]
        },
        {
          title: 'Customizing Categories',
          description: 'Add, edit, or remove categories to match your specific needs:',
          steps: [
            'Click "Add Category" to create new categories',
            'Use the edit button to modify existing categories',
            'Delete categories that you no longer need',
            'Categories are automatically available in transaction dropdowns'
          ]
        }
      ]
    },
    {
      id: 'summary',
      title: 'Financial Summary',
      icon: FiBarChart3,
      content: [
        {
          title: 'Summary Cards',
          description: 'The summary provides key financial metrics at a glance:',
          steps: [
            'Total Income: Sum of all income transactions',
            'Total Expenses: Sum of all expense transactions',
            'Net Position: Income minus expenses',
            'Total Transactions: Count of all recorded transactions'
          ]
        },
        {
          title: 'Category Breakdown',
          description: 'View spending patterns by category with visual progress bars showing the percentage of total activity for each category.',
        },
        {
          title: 'Quick Statistics',
          description: 'Additional insights include:',
          steps: [
            'Average transaction amount',
            'Largest expense recorded',
            'Largest income received'
          ]
        }
      ]
    },
    {
      id: 'reports',
      title: 'Advanced Reports',
      icon: FiPieChart,
      content: [
        {
          title: 'Dynamic Filtering',
          description: 'Generate custom reports using multiple filter options:',
          steps: [
            'Filter by specific months',
            'Filter by category',
            'Filter by transaction type',
            'Combine filters for detailed analysis'
          ]
        },
        {
          title: 'Category Analysis',
          description: 'Detailed breakdown showing income, expenses, and transaction counts for each category.',
        },
        {
          title: 'Monthly Breakdown',
          description: 'When viewing all months, see a comprehensive monthly analysis with category-wise breakdowns.',
        },
        {
          title: 'Export Functionality',
          description: 'Export filtered data to CSV format for external analysis or record-keeping.',
        }
      ]
    },
    {
      id: 'charts',
      title: 'Visual Charts',
      icon: FiTrendingUp,
      content: [
        {
          title: 'Income vs Expenses Trend',
          description: 'Line chart showing monthly income, expenses, and net position over time. Includes smooth curves and area fills for better visualization.',
        },
        {
          title: 'Category Pie Charts',
          description: 'Separate pie charts for:',
          steps: [
            'Expense category breakdown',
            'Income source breakdown',
            'Interactive legends and tooltips'
          ]
        },
        {
          title: 'Monthly Comparison',
          description: 'Bar chart comparing income vs expenses for the last 6 months, helping identify spending trends.',
        },
        {
          title: 'Interactive Features',
          description: 'All charts include:',
          steps: [
            'Hover tooltips with detailed information',
            'Responsive design for all screen sizes',
            'Professional styling with consistent colors'
          ]
        }
      ]
    },
    {
      id: 'automation',
      title: 'Automation Features',
      icon: FiAlertTriangle,
      content: [
        {
          title: 'Automatic Calculations',
          description: 'All financial calculations are performed automatically:',
          steps: [
            'Real-time summary updates',
            'Automatic category totals',
            'Dynamic chart updates',
            'Instant filtering and sorting'
          ]
        },
        {
          title: 'Data Persistence',
          description: 'Your data is automatically saved to your browser\'s local storage, ensuring your information persists between sessions.',
        },
        {
          title: 'Conditional Formatting',
          description: 'Transactions exceeding your alert threshold are automatically highlighted with warning indicators.',
        },
        {
          title: 'Smart Filtering',
          description: 'Category dropdowns automatically filter based on transaction type, preventing invalid combinations.',
        }
      ]
    },
    {
      id: 'customization',
      title: 'Customization Options',
      icon: FiFilter,
      content: [
        {
          title: 'Alert Thresholds',
          description: 'Set custom alert thresholds to highlight large transactions that require attention.',
        },
        {
          title: 'Category Management',
          description: 'Fully customize your categories to match your specific financial situation and preferences.',
        },
        {
          title: 'Date Ranges',
          description: 'Filter and analyze data for specific time periods to focus on relevant financial periods.',
        },
        {
          title: 'Export Options',
          description: 'Export your data in CSV format for use with other financial tools or for backup purposes.',
        }
      ]
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      icon: FiDownload,
      content: [
        {
          title: 'Regular Data Entry',
          description: 'For best results, enter transactions regularly rather than in large batches.',
        },
        {
          title: 'Consistent Categorization',
          description: 'Use consistent category names and descriptions to maintain clean, analyzable data.',
        },
        {
          title: 'Regular Reviews',
          description: 'Review your Summary and Reports regularly to:',
          steps: [
            'Identify spending patterns',
            'Track progress toward financial goals',
            'Spot unusual or unexpected expenses',
            'Make informed financial decisions'
          ]
        },
        {
          title: 'Data Backup',
          description: 'Regularly export your data to CSV as a backup, especially before making significant changes.',
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">User Guide</h2>
        
        <div className="space-y-4">
          {guideContent.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={section.icon} className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                </div>
                <SafeIcon 
                  icon={expandedSection === section.id ? FiChevronDown : FiChevronRight} 
                  className="w-5 h-5 text-gray-500" 
                />
              </button>
              
              {expandedSection === section.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 py-4 space-y-6"
                >
                  {section.content.map((item, index) => (
                    <div key={index} className="space-y-3">
                      <h4 className="text-base font-semibold text-gray-700">{item.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      {item.steps && (
                        <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                          {item.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="leading-relaxed">{step}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <h3 className="text-lg font-semibold text-primary-800 mb-2">Need Help?</h3>
          <p className="text-primary-700">
            This budget tracker is designed to be intuitive and user-friendly. If you have questions about specific features, 
            refer to the relevant section above. Remember that your data is automatically saved and you can always export 
            your information for backup purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;