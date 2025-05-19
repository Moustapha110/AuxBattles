import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

const Battles = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [joinCode, setJoinCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleJoinBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    if (joinCode.length !== 7) {
      toast.error('Room code must be 7 characters');
      return;
    }

    setIsLoading(true);
    try {
      // Check if battle exists and is joinable
      const { data: battles, error: battleError } = await supabase
        .from('battles')
        .select('id, max_players, status')
        .eq('code', joinCode.toUpperCase())
        .single();

      if (battleError) {
        if (battleError.code === 'PGRST116') {
          throw new Error('Battle not found');
        }
        throw battleError;
      }

      if (!battles) {
        throw new Error('Battle not found');
      }

      if (battles.status !== 'waiting') {
        throw new Error('Battle has already started or ended');
      }

      // Check if user is already in the battle
      const { data: existingPlayer } = await supabase
        .from('battle_players')
        .select('*')
        .eq('battle_id', battles.id)
        .eq('user_id', user?.id)
        .single();

      if (existingPlayer) {
        navigate(`/room/${joinCode}`);
        return;
      }

      // Check if battle is full
      const { count: playerCount } = await supabase
        .from('battle_players')
        .select('*', { count: 'exact', head: true })
        .eq('battle_id', battles.id);

      if (typeof playerCount === 'number' && playerCount >= battles.max_players) {
        throw new Error('Battle is full');
      }

      // Join the battle
      const { error: joinError } = await supabase
        .from('battle_players')
        .insert([
          {
            battle_id: battles.id,
            user_id: user?.id,
            is_host: false,
          },
        ]);

      if (joinError) {
        throw joinError;
      }

      toast.success('Successfully joined the battle!');
      navigate(`/room/${joinCode.toUpperCase()}`);
    } catch (error) {
      console.error('Error joining battle:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to join battle');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-8">
      <div className="flex items-center mb-8">
        <Music className="text-red-500 mr-2" size={32} />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
          AUX BATTLES
        </h1>
      </div>

      <div className="w-full max-w-md space-y-6">
        <button
          onClick={() => navigate('/create')}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-semibold text-lg hover:opacity-90 transition"
        >
          Create Battle
        </button>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg p-0.5">
            <form onSubmit={handleJoinBattle} className="flex bg-black rounded-lg">
              <input
                type="text"
                placeholder="Enter 7-digit room code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="flex-1 bg-transparent p-4 outline-none placeholder-gray-500"
                maxLength={7}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="px-6 py-4 text-white font-semibold rounded-r-lg disabled:opacity-50"
                disabled={joinCode.length !== 7 || isLoading}
              >
                {isLoading ? 'Joining...' : 'Join'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Battles;