import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Crown, ChevronLeft, Music, Disc, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

interface Player {
  user_id: string;
  is_host: boolean;
  username?: string;
}

interface Battle {
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
  const [copied, setCopied] = useState(false);

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

        if (battleError || !battles?.length) {
          toast.error('Battle not found');
          navigate('/');
          return;
        }

        setBattle(battles[0]);

        // Subscribe to player changes
        const playersSubscription = supabase
          .from('battle_players')
          .select(`
            user_id,
            is_host,
            profiles (
              username
            )
          `)
          .eq('battle_id', battles[0].id)
          .on('*', (payload) => {
            fetchPlayers(battles[0].id);
          })
          .subscribe();

        // Initial player fetch
        await fetchPlayers(battles[0].id);
        setLoading(false);

        return () => {
          supabase.removeChannel(playersSubscription);
        };
      } catch (error) {
        console.error('Error fetching battle:', error);
        toast.error('Failed to load battle');
        navigate('/');
      }
    };

    fetchBattleAndPlayers();
  }, [roomId, navigate]);

  const fetchPlayers = async (battleId: string) => {
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
      return;
    }

    setPlayers(players || []);
  };

  const handleStartBattle = async () => {
    if (!battle) return;

    try {
      const { error } = await supabase
        .from('battles')
        .update({ status: 'in_progress' })
        .eq('id', battle.id)
        .eq('host_id', user?.id);

      if (error) throw error;
      // Navigate to game page (to be implemented)
      toast.success('Battle started!');
    } catch (error) {
      toast.error('Failed to start battle');
    }
  };

  const handleCopyCode = async () => {
    if (!roomId) return;
    
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success('Room code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
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
        <div className="relative inline-flex items-center">
          <div className="bg-gradient-to-r from-red-500/10 to-purple-500/10 backdrop-blur-sm px-8 py-4 rounded-lg font-mono text-2xl tracking-wider border border-gray-800">
            {roomId}
          </div>
          <button
            onClick={handleCopyCode}
            className="absolute right-3 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            title="Copy room code"
          >
            {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
          </button>
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
                    : player.username || 'Anonymous'}
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