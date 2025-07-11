import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiList, FiTag, FiBarChart3, FiPieChart, FiTrendingUp, FiBook, FiDollarSign, FiUsers, FiLogOut } = FiIcons;

const Navigation = ({ userProfile }) => {
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: FiHome
    },
    {
      path: '/transactions',
      label: 'Transactions',
      icon: FiList
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: FiTag
    },
    {
      path: '/summary',
      label: 'Summary',
      icon: FiBarChart3
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: FiPieChart
    },
    {
      path: '/charts',
      label: 'Charts',
      icon: FiTrendingUp
    },
    {
      path: '/guide',
      label: 'User Guide',
      icon: FiBook
    },
  ];

  // Add admin routes if user is admin
  if (userProfile?.role === 'admin') {
    navItems.push({
      path: '/admin/users',
      label: 'Users',
      icon: FiUsers
    });
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiDollarSign} className="w-8 h-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-800">
              Financial Wealth Builder
              {userProfile && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  - {userProfile.full_name}
                </span>
              )}
            </h1>
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative"
              >
                <motion.div
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SafeIcon icon={item.icon} className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </Link>
            ))}
            
            <button
              onClick={handleSignOut}
              className="ml-4 px-4 py-2 rounded-lg flex items-center space-x-2 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <SafeIcon icon={FiLogOut} className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;