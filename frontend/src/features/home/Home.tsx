import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart2, Users, Scale, ArrowRight, Activity, 
  Trophy, Zap, Search 
} from 'lucide-react';
import { getTeamsList } from '../../api/client';

export const Home = () => {
  const navigate = useNavigate();

  // Load basic data for stats
  const { data: teams } = useQuery({
    queryKey: ['teams-list'],
    queryFn: getTeamsList,
  });

  // Calculate quick stats
  const totalTeams = teams?.length || 0;
  // Mock stats (replace with real metrics if available)
  const matchesScouted = 42; 
  const avgEventScore = 35.5; 

  const navigationCards = [
    {
      title: 'Global Analysis',
      description: 'View scatter plots, rankings, and performance trends.',
      icon: <BarChart2 size={24} className="text-indigo-400" />,
      path: '/analysis',
      color: 'bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500',
    },
    {
      title: 'Compare Teams',
      description: 'Head-to-head comparison for alliance selection.',
      icon: <Scale size={24} className="text-emerald-400" />,
      path: '/compare',
      color: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500',
    },
    {
      title: 'Team Directory',
      description: 'Browse all teams and detailed profiles.',
      icon: <Users size={24} className="text-blue-400" />,
      path: '/teams',
      color: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500',
    }
  ];

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500">
      
      {/* --- HERO SECTION --- */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Scouter</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Ready to analyze the competition? Here is the summary of the event so far.
        </p>
      </div>

      {/* --- QUICK STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
            <Users size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-white">{totalTeams}</div>
            <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Active Teams</div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
            <Activity size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-white">{matchesScouted}</div>
            <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Matches Recorded</div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
            <Trophy size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-white">{avgEventScore}</div>
            <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Avg Event Score</div>
          </div>
        </div>
      </div>

      {/* --- NAVIGATION SHORTCUTS --- */}
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Zap size={20} className="text-yellow-400" /> Quick Actions
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {navigationCards.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.path)}
            className={`group text-left p-6 rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${card.color}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-950 rounded-xl shadow-inner group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <ArrowRight className="text-slate-600 group-hover:text-white transition-colors" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
              {card.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {card.description}
            </p>
          </button>
        ))}
      </div>

      {/* --- SEARCH BAR (Optional Quick Jump) --- */}
      <div className="mt-12 bg-slate-900/30 border border-slate-800 rounded-2xl p-8 text-center">
        <h3 className="text-lg font-bold text-slate-300 mb-4">Looking for a specific robot?</h3>
        <button 
            onClick={() => navigate('/teams')}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all border border-slate-700"
        >
            <Search size={18} />
            Go to Search
        </button>
      </div>

    </div>
  );
};