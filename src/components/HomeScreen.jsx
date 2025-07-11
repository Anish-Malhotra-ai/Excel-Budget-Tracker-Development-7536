import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBudget } from '../context/BudgetContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiList, 
  FiTag, 
  FiBarChart3, 
  FiPieChart, 
  FiTrendingUp, 
  FiBook,
  FiDollarSign,
  FiArrowRight,
  FiClock,
  FiTarget,
  FiUsers
} = FiIcons;

const HomeScreen = ({ userProfile }) => {
  const { 
    getTotalIncome, 
    getTotalExpenses, 
    getNetPosition,
    currentFinancialYear 
  } = useBudget();

  const totalIncome = getTotalIncome(currentFinancialYear);
  const totalExpenses = getTotalExpenses(currentFinancialYear);
  const netPosition = getNetPosition(currentFinancialYear);

  const menuItems = [
    {
      title: 'Transactions',
      path: '/transactions',
      icon: FiList,
      color: 'bg-blue-500',
      description: 'Record and manage your financial transactions'
    },
    {
      title: 'Categories',
      path: '/categories',
      icon: FiTag,
      color: 'bg-purple-500',
      description: 'Organize your income and expenses into categories'
    },
    {
      title: 'Summary',
      path: '/summary',
      icon: FiBarChart3,
      color: 'bg-green-500',
      description: 'Get a quick overview of your financial status'
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: FiPieChart,
      color: 'bg-orange-500',
      description: 'Generate detailed financial reports and analysis'
    },
    {
      title: 'Charts',
      path: '/charts',
      icon: FiTrendingUp,
      color: 'bg-pink-500',
      description: 'Visualize your financial data with interactive charts'
    },
    {
      title: 'User Guide',
      path: '/guide',
      icon: FiBook,
      color: 'bg-teal-500',
      description: 'Learn how to use all features effectively'
    }
  ];

  // Add admin menu item if user is admin
  if (userProfile?.role === 'admin') {
    menuItems.push({
      title: 'User Management',
      path: '/admin/users',
      icon: FiUsers,
      color: 'bg-indigo-500',
      description: 'Manage user accounts and permissions'
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SafeIcon icon={FiDollarSign} className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Financial Wealth Builder
            </h1>
            {userProfile && (
              <p className="text-xl text-primary-600 mb-2">
                Hello, {userProfile.full_name}!
              </p>
            )}
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Take control of your finances with our comprehensive wealth management solution.
              Track expenses, monitor income, and achieve your financial goals.
            </p>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-success-500 to-success-600 rounded-lg p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-100">Total Income</p>
                <p className="text-3xl font-bold">${totalIncome.toFixed(2)}</p>
              </div>
              <SafeIcon icon={FiTrendingUp} className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-danger-500 to-danger-600 rounded-lg p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-danger-100">Total Expenses</p>
                <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
              </div>
              <SafeIcon icon={FiClock} className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100">Net Position</p>
                <p className="text-3xl font-bold">${netPosition.toFixed(2)}</p>
              </div>
              <SafeIcon icon={FiTarget} className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className={`${item.color} p-4 text-white`}>
                  <SafeIcon icon={item.icon} className="w-8 h-8" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {item.description}
                  </p>
                  <div className="flex items-center text-primary-600 font-medium">
                    <span>Get Started</span>
                    <SafeIcon icon={FiArrowRight} className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Powerful Features to Build Your Financial Wealth
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <SafeIcon icon={FiTarget} className="w-10 h-10 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Budget Planning</h3>
                <p className="text-gray-600">Set and track budgets for different categories</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <SafeIcon icon={FiPieChart} className="w-10 h-10 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Visual Analytics</h3>
                <p className="text-gray-600">Understand your spending with interactive charts</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <SafeIcon icon={FiBarChart3} className="w-10 h-10 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Financial Reports</h3>
                <p className="text-gray-600">Generate detailed reports for better insights</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;