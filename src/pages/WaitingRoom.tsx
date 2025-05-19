import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Crown, ChevronLeft, Music, Disc } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

interface Player {
  user_id: string;
  is_host: boolean;
  profiles?: {
    username: string | null;
  };
}

interface Battle {
  id: string;
  theme: string;
  category: string;
  max_players: number;
  host_id: string;
  status: string;
}

const WaitingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const fetchBattleAndPlayers = async () => {
      try {
        // Fetch battle details
        const { data: battles, error: battleError } = await supabase
          .from('battles')
          .select('*')
          .eq('code', roomId)
          .limit(1);

        if (battleError) {
          console.error('Error fetching battle:', battleError);
          throw new Error('Failed to load battle details');
        }

        if (!battles?.length) {
          throw new Error('Battle not found');
        }

        setBattle(battles[0]);

        // Initial player fetch
        await fetchPlayers(battles[0].id);

        // Subscribe to player changes
        const playersSubscription = supabase
          .channel(`battle_${battles[0].id}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'battle_players',
            filter: `battle_id=eq.${battles[0].id}`
          }, () => {
            fetchPlayers(battles[0].id);
          })
          .subscribe();

        setLoading(false);

        return () => {
          supabase.removeChannel(playersSubscription);
        };
      } catch (error) {
        console.error('Error in fetchBattleAndPlayers:', error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to load battle');
        }
        navigate('/');
      }
    };

    fetchBattleAndPlayers();
  }, [roomId, navigate]);

  const fetchPlayers = async (battleId: string) => {
    try {
      const { data: players, error: playersError } = await supabase
        .from('battle_players')
        .select(`
          user_id,
          is_host,
          profiles (
            username
          )
        `)
        .eq('battle_id', battleId);

      if (playersError) {
        console.error('Error fetching players:', playersError);
        throw new Error('Failed to load players');
      }

      setPlayers(players || []);
    } catch (error) {
      console.error('Error in fetchPlayers:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleStartBattle = async () => {
    if (!battle) return;

    try {
      const { error } = await supabase
        .from('battles')
        .update({ status: 'in_progress' })
        .eq('id', battle.id)
        .eq('host_id', user?.id);

      if (error) {
        console.error('Error starting battle:', error);
        throw new Error('Failed to start battle');
      }

      toast.success('Battle started!');
    } catch (error) {
      console.error('Error in handleStartBattle:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to start battle');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!battle) return null;

  const isHost = battle.host_id === user?.id;

  return (
    <div className="pt-4">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-400 mb-6 hover:text-white transition-colors"
      >
        <ChevronLeft size={24} />
        <span>Back</span>
      </button>

      <div className="text-center mb-8">
        <h2 className="text-xl font-medium mb-3">Room Code</h2>
        <div className="bg-gradient-to-r from-red-500/10 to-purple-500/10 backdrop-blur-sm inline-block px-8 py-4 rounded-lg font-mono text-2xl tracking-wider border border-gray-800">
          {roomId}
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Music className="text-red-500" size={18} />
            <span className="text-sm text-gray-400">Theme</span>
          </div>
          <span className="text-lg">{battle.theme}</span>
        </div>

        <div className="flex-1 bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Disc className="text-purple-500" size={18} />
            <span className="text-sm text-gray-400">Category</span>
          </div>
          <span className="text-lg">{battle.category}</span>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gray-400" />
            <h3 className="font-medium">Players</h3>
          </div>
          <span className="text-sm text-gray-400">
            {players.length}/{battle.max_players} Players
          </span>
        </div>
        <div className="space-y-4">
          {players.map((player) => (
            <div
              key={player.user_id}
              className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3"
            >
              <div className="flex items-center gap-2">
                {player.is_host && (
                  <Crown size={16} className="text-yellow-500" />
                )}
                <span>
                  {player.user_id === user?.id
                    ? 'You'
                    : player.profiles?.username || 'Anonymous'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isHost && (
        <button
          onClick={handleStartBattle}
          disabled={players.length < 2}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {players.length < 2
            ? 'Waiting for Players...'
            : 'Start Battle'}
        </button>
      )}
    </div>
  );
};

export default WaitingRoom;