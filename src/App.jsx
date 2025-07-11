import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from './lib/supabase';
import Navigation from './components/Navigation';
import SignInScreen from './components/auth/SignInScreen';
import HomeScreen from './components/HomeScreen';
import TransactionsSheet from './components/TransactionsSheet';
import CategoriesSheet from './components/CategoriesSheet';
import SummarySheet from './components/SummarySheet';
import ReportsSheet from './components/ReportsSheet';
import ChartsSheet from './components/ChartsSheet';
import UserGuide from './components/UserGuide';
import UserManagement from './components/admin/UserManagement';
import { BudgetProvider } from './context/BudgetContext';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setUserProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return <SignInScreen />;
  }

  return (
    <BudgetProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation userProfile={userProfile} />
          <motion.main
            className="container mx-auto px-4 py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<HomeScreen userProfile={userProfile} />} />
              <Route path="/transactions" element={<TransactionsSheet />} />
              <Route path="/categories" element={<CategoriesSheet />} />
              <Route path="/summary" element={<SummarySheet />} />
              <Route path="/reports" element={<ReportsSheet />} />
              <Route path="/charts" element={<ChartsSheet />} />
              <Route path="/guide" element={<UserGuide />} />
              {userProfile?.role === 'admin' && (
                <Route path="/admin/users" element={<UserManagement />} />
              )}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.main>
        </div>
      </Router>
    </BudgetProvider>
  );
}

export default App;