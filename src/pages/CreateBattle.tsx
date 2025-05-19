import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

const THEMES = ['Sad', 'Hype', 'Heartbreak', 'Love', 'Party', 'Chill'];
const CATEGORIES = ['R&B', 'Hip-Hop', 'Rap', 'Pop', 'Rock', 'Alternative'];

const CreateBattle = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [theme, setTheme] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 7 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  };

  const handleCreateBattle = async () => {
    if (!theme || !category || !user) return;
    
    setIsCreating(true);
    try {
      const code = generateRoomCode();
      
      // Use a single query to create both the battle and the player
      const { data: battle, error: battleError } = await supabase
        .rpc('create_battle_with_host', {
          p_code: code,
          p_theme: theme,
          p_category: category,
          p_host_id: user.id
        });

      if (battleError) {
        console.error('Battle creation error:', battleError);
        throw new Error('Failed to create battle');
      }

      if (!battle) {
        throw new Error('Failed to create battle - no data returned');
      }

      navigate(`/room/${code}`);
    } catch (error) {
      console.error('Error in handleCreateBattle:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred while creating the battle');
      }
    } finally {
      setIsCreating(false);
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

      <h1 className="text-2xl font-bold mb-8">Create Battle</h1>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium mb-4">Select Theme</label>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === t
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-gray-700 hover:border-purple-500 text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-4">Select Category</label>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  category === c
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-gray-700 hover:border-red-500 text-gray-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreateBattle}
          disabled={!theme || !category || isCreating}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-semibold disabled:opacity-50 transition-opacity"
        >
          {isCreating ? 'Creating Battle...' : 'Start Battle'}
        </button>
      </div>
    </div>
  );
};

export default CreateBattle;