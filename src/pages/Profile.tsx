import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="pt-4">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-400 mb-6 hover:text-white transition-colors"
      >
        <ChevronLeft size={24} />
        <span>Back</span>
      </button>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-8">Profile</h1>

        <div className="space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-purple-500 rounded-full flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.email?.split('@')[0]}</h2>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail size={16} />
                  <span className="text-sm">{user?.email}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Game Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <span className="text-sm text-gray-400">Total Battles</span>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <span className="text-sm text-gray-400">Wins</span>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <span className="text-sm text-gray-400">Win Rate</span>
                <p className="text-2xl font-bold">0%</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <span className="text-sm text-gray-400">Total Points</span>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;