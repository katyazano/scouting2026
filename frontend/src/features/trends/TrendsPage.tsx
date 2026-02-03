import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Trophy, TrendingUp, Zap, Target, Activity, Loader2, ArrowRight, BarChart3 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { getEventMetric } from '../../api/client';

// --- COMPONENT: DISTRIBUTION CHART ---
const DistributionChart = ({ data }: { data: any[] }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        const scores = data.map((d: any) => Number(d.avg));
        const max = Math.max(...scores);
        const binSize = 5; 
        const bins: Record<string, number> = {};

        const maxBin = Math.ceil((max + 1) / binSize) * binSize;
        for (let i = 0; i < maxBin; i += binSize) {
            bins[i] = 0;
        }

        scores.forEach(score => {
            const bin = Math.floor(score / binSize) * binSize;
            bins[bin] = (bins[bin] || 0) + 1;
        });

        return Object.keys(bins).map(bin => {
            const start = Number(bin);
            return {
                name: `${start}-${start + binSize}`, 
                rangeLabel: `${start} to ${start + binSize} pts`,
                count: bins[bin],
                startVal: start
            };
        }).sort((a, b) => a.startVal - b.startVal);
    }, [data]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl z-50">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1 tracking-wider">
                        Range: {data.rangeLabel}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">{data.count}</span>
                        <span className="text-sm font-bold text-slate-500">Teams</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-full w-full min-h-[160px]"> 
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} barCategoryGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60} animationDuration={1000}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.startVal >= 50 ? '#10b981' : entry.startVal >= 30 ? '#6366f1' : '#475569'} strokeWidth={0} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- COMPONENT: LEADERBOARD CARD (UPDATED WITH COLORED BADGES) ---
const LeaderboardCard = ({ title, icon: Icon, data, colorClass, isPercent = false }: any) => {
  const navigate = useNavigate();

  // Helper para asignar estilos según el ranking
  const getRankBadgeStyle = (index: number) => {
    switch (index) {
        case 0: return 'bg-yellow-400 text-yellow-950 shadow-[0_0_10px_rgba(250,204,21,0.3)]'; // Gold
        case 1: return 'bg-slate-300 text-slate-900 shadow-[0_0_10px_rgba(203,213,225,0.3)]';   // Silver
        case 2: return 'bg-orange-400 text-orange-950 shadow-[0_0_10px_rgba(251,146,60,0.3)]';  // Bronze
        default: return 'bg-slate-800 text-slate-500 border border-slate-700';                 // Others
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full hover:border-indigo-500/30 transition-all duration-300">
      <div className={`p-4 border-b border-slate-800 flex items-center gap-2 ${colorClass}`}>
        <Icon size={20} />
        <h3 className="font-bold uppercase tracking-wider text-sm">{title}</h3>
      </div>
      <div className="divide-y divide-slate-800/50 flex-1 overflow-auto max-h-80 custom-scrollbar">
        {data.map((team: any, idx: number) => (
          <div key={team.team_num} onClick={() => navigate(`/teams/${team.team_num}`)} className="p-3 flex justify-between items-center hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              
              {/* RANK BADGE */}
              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black ${getRankBadgeStyle(idx)}`}>
                 {idx + 1}
              </div>

              <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{team.team_num}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 font-bold group-hover:text-indigo-300">
                    {isPercent ? `${(Number(team.avg) * 100).toFixed(0)}%` : Number(team.avg).toFixed(1)}
                </span>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-500" />
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="p-4 text-center text-xs text-slate-600 italic">No data available</div>}
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export const TrendsPage = () => {
  const qTotal = useQuery({ queryKey: ['metric', 'match_avg_total_pts'], queryFn: () => getEventMetric('match_avg_total_pts') });
  const qAuto = useQuery({ queryKey: ['metric', 'auto_total_pts'], queryFn: () => getEventMetric('auto_total_pts') });
  const qTeleFuel = useQuery({ queryKey: ['metric', 'tele_avg_fuel'], queryFn: () => getEventMetric('tele_avg_fuel') });
  const qHang = useQuery({ queryKey: ['metric', 'tele_hang_success_rate'], queryFn: () => getEventMetric('tele_hang_success_rate') });

  const isLoading = qTotal.isLoading || qAuto.isLoading || qTeleFuel.isLoading || qHang.isLoading;

  const rankings = useMemo(() => {
    const getTop10 = (queryResult: any) => {
      if (!queryResult?.data) return [];
      return [...queryResult.data].sort((a: any, b: any) => Number(b.avg) - Number(a.avg)).slice(0, 10);
    };
    return {
      total: getTop10(qTotal.data),
      auto: getTop10(qAuto.data),
      teleop: getTop10(qTeleFuel.data),
      hang: getTop10(qHang.data),
    };
  }, [qTotal.data, qAuto.data, qTeleFuel.data, qHang.data]);

  const globalStats = useMemo(() => {
    if (!qTotal.data?.data) return { avgScore: 0, maxScore: 0, medianScore: 0 };
    const scores = qTotal.data.data.map((d: any) => Number(d.avg)).sort((a:number, b:number) => a - b);
    const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / (scores.length || 1);
    const maxScore = Math.max(...scores, 0);
    const medianScore = scores[Math.floor(scores.length / 2)] || 0;
    return { avgScore, maxScore, medianScore };
  }, [qTotal.data]);

  if (isLoading) return <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-pulse"><Loader2 size={48} className="animate-spin mb-4 text-indigo-500" /><p>Analyzing event data...</p></div>;

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500 overflow-y-auto pb-8">
      
      {/* HEADER */}
      <div className="mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <TrendingUp className="text-indigo-500" /> Event Trends
          </h1>
          <p className="text-slate-400 mt-2">Global analysis and tournament leaders.</p>
      </div>

      {/* GLOBAL STATS & CHART GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
         
         {/* LEFT COLUMN: STATS CARDS */}
         <div className="space-y-4 flex flex-col">
            <div className="bg-indigo-900/10 border border-indigo-500/20 p-5 rounded-xl flex items-center gap-4 flex-1">
                <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400"><Activity size={24} /></div>
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Event Average</p>
                    <p className="text-3xl font-black text-white">{globalStats.avgScore.toFixed(1)}</p>
                </div>
            </div>
            <div className="bg-emerald-900/10 border border-emerald-500/20 p-5 rounded-xl flex items-center gap-4 flex-1">
                <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400"><Trophy size={24} /></div>
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Highest Avg</p>
                    <p className="text-3xl font-black text-white">{globalStats.maxScore.toFixed(1)}</p>
                </div>
            </div>
            <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-xl flex items-center gap-4 flex-1">
                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400"><Target size={24} /></div>
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Median Score</p>
                    <p className="text-3xl font-black text-white">{globalStats.medianScore.toFixed(1)}</p>
                </div>
            </div>
         </div>

         {/* RIGHT COLUMN: CHART */}
         <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-6 flex flex-col h-full">
            <h3 className="text-white font-bold flex items-center gap-2 mb-2">
                <BarChart3 className="text-indigo-500" size={18} /> Score Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">
                Score frequency distribution across all teams.
            </p>
            <div className="flex-1 min-h-0">
                <DistributionChart data={qTotal.data?.data} />
            </div>
         </div>
      </div>

      {/* LEADERBOARDS */}
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Trophy size={20} className="text-yellow-500" /> Category Leaders (Top 10)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LeaderboardCard title="Top Overall" icon={Trophy} data={rankings.total} colorClass="text-yellow-400 bg-yellow-400/5" />
        <LeaderboardCard title="Top Auto" icon={Zap} data={rankings.auto} colorClass="text-indigo-400 bg-indigo-400/5" />
        <LeaderboardCard title="Top Teleop Notes" icon={Target} data={rankings.teleop} colorClass="text-emerald-400 bg-emerald-400/5" />
        <LeaderboardCard title="Top Hang %" icon={Activity} data={rankings.hang} colorClass="text-cyan-400 bg-cyan-400/5" isPercent={true} />
      </div>
    </div>
  );
};