import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Music, BarChart3, User } from 'lucide-react';
import { useAuth } from '../lib/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-purple-800">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center space-y-1 ${
            location.pathname === '/' ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          <Music size={24} />
          <span className="text-xs">Battles</span>
        </button>
        <button
          onClick={() => navigate('/stats')}
          className={`flex flex-col items-center space-y-1 ${
            location.pathname === '/stats' ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          <BarChart3 size={24} />
          <span className="text-xs">Stats</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center space-y-1 ${
            location.pathname === '/profile' ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          <User size={24} />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;