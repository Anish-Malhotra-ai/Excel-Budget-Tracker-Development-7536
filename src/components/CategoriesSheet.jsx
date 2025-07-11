import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBudget } from '../context/BudgetContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit2, FiTrash2, FiTag, FiDollarSign } = FiIcons;

const CategoriesSheet = () => {
  const { categories, addCategory, updateCategory, deleteCategory, currentFinancialYear } = useBudget();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Expense',
    budget: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
      setEditingCategory(null);
    } else {
      addCategory(formData);
    }
    setFormData({
      name: '',
      type: 'Expense',
      budget: 0,
    });
    setShowForm(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      budget: category.budget || 0,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      type: 'Expense',
      budget: 0,
    });
  };

  const incomeCategories = categories.filter(cat => cat.type === 'Income');
  const expenseCategories = categories.filter(cat => cat.type === 'Expense');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Categories & Budgets</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage categories and set budget targets for FY {currentFinancialYear}
            </p>
          </div>
          <motion.button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Category</span>
          </motion.button>
        </div>

        {/* Category Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg border"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type === 'Income' ? 'Target' : 'Budget'} Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex items-end space-x-2">
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
                  {editingCategory ? 'Update' : 'Add'} Category
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Income Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-success-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-success-800 mb-4 flex items-center">
              <SafeIcon icon={FiTag} className="w-5 h-5 mr-2" />
              Income Categories ({incomeCategories.length})
            </h3>
            <div className="space-y-3">
              {incomeCategories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col bg-white rounded-lg border border-success-200 overflow-hidden"
                >
                  <div className="p-3 flex items-center justify-between border-b border-success-100">
                    <span className="font-medium text-gray-800">{category.name}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-primary-600 hover:text-primary-800 transition-colors"
                        aria-label="Edit category"
                      >
                        <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-danger-600 hover:text-danger-800 transition-colors"
                        aria-label="Delete category"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-success-50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-success-700 flex items-center">
                        <SafeIcon icon={FiDollarSign} className="w-4 h-4 mr-1" />
                        Target:
                      </span>
                      <span className="font-medium">${category.budget?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {incomeCategories.length === 0 && (
                <p className="text-success-600 text-center py-4">No income categories yet</p>
              )}
            </div>
          </div>

          {/* Expense Categories */}
          <div className="bg-danger-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-danger-800 mb-4 flex items-center">
              <SafeIcon icon={FiTag} className="w-5 h-5 mr-2" />
              Expense Categories ({expenseCategories.length})
            </h3>
            <div className="space-y-3">
              {expenseCategories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col bg-white rounded-lg border border-danger-200 overflow-hidden"
                >
                  <div className="p-3 flex items-center justify-between border-b border-danger-100">
                    <span className="font-medium text-gray-800">{category.name}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-primary-600 hover:text-primary-800 transition-colors"
                        aria-label="Edit category"
                      >
                        <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-danger-600 hover:text-danger-800 transition-colors"
                        aria-label="Delete category"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-danger-50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-danger-700 flex items-center">
                        <SafeIcon icon={FiDollarSign} className="w-4 h-4 mr-1" />
                        Budget:
                      </span>
                      <span className="font-medium">${category.budget?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {expenseCategories.length === 0 && (
                <p className="text-danger-600 text-center py-4">No expense categories yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesSheet;