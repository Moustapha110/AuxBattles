import React, { useEffect, useState } from 'react';
import { Trophy, Award, Percent, ChevronLeft, Clock, Star, Music, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

interface UserStats {
  totalPoints: number;
  wins: number;
  totalGames: number;
  winRatio: number;
  averageScore: number;
  longestStreak: number;
  favoriteCategory: string;
  totalPlaytime: number;
}

const Stats = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    wins: 0,
    totalGames: 0,
    winRatio: 0,
    averageScore: 0,
    longestStreak: 0,
    favoriteCategory: '-',
    totalPlaytime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        // If data exists, update the stats
        if (data) {
          setStats({
            totalPoints: data.total_points || 0,
            wins: data.wins || 0,
            totalGames: data.total_battles || 0,
            winRatio: data.total_battles ? (data.wins / data.total_battles) * 100 : 0,
            averageScore: data.average_score || 0,
            longestStreak: data.longest_streak || 0,
            favoriteCategory: data.favorite_category || '-',
            totalPlaytime: data.total_playtime || 0,
          });
        }
        // If no data exists, just keep the default values set in useState
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-400 mb-6 hover:text-white transition-colors"
      >
        <ChevronLeft size={24} />
        <span>Back</span>
      </button>

      <h1 className="text-2xl font-bold mb-8">Your Stats</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-red-500/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="text-yellow-500" size={20} />
            <span className="text-sm text-gray-400">Total Points</span>
          </div>
          <span className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</span>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-purple-500/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-red-500" size={20} />
            <span className="text-sm text-gray-400">Wins</span>
          </div>
          <span className="text-2xl font-bold">{stats.wins}</span>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-red-500/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Star className="text-purple-500" size={20} />
            <span className="text-sm text-gray-400">Average Score</span>
          </div>
          <span className="text-2xl font-bold">{Math.round(stats.averageScore)}</span>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-purple-500/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="text-green-500" size={20} />
            <span className="text-sm text-gray-400">Win Rate</span>
          </div>
          <span className="text-2xl font-bold">{stats.winRatio.toFixed(1)}%</span>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-red-500/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="text-orange-500" size={20} />
            <span className="text-sm text-gray-400">Longest Streak</span>
          </div>
          <span className="text-2xl font-bold">{stats.longestStreak}</span>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-purple-500/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-500" size={20} />
            <span className="text-sm text-gray-400">Total Playtime</span>
          </div>
          <span className="text-2xl font-bold">{Math.round(stats.totalPlaytime / 60)}h</span>
        </div>

        <div className="col-span-2 bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-green-500/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Music className="text-green-500" size={20} />
            <span className="text-sm text-gray-400">Favorite Category</span>
          </div>
          <span className="text-2xl font-bold">{stats.favoriteCategory}</span>
        </div>
      </div>
    </div>
  );
};

export default Stats;