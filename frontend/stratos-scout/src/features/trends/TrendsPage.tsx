import { useQuery } from '@tanstack/react-query';
import { Trophy, TrendingUp, Zap, Target, Activity } from 'lucide-react';
import { getTeamsList, getTeamOverview } from '../../api/client';
import { apiClient } from '../../api/client';
import type { TeamOverview } from '../../types';
import { useState, useEffect } from 'react';

// Componente para una tarjeta de Top 5
const LeaderboardCard = ({ title, icon: Icon, data, metricKey, colorClass }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
    <div className={`p-4 border-b border-slate-800 flex items-center gap-2 ${colorClass}`}>
      <Icon size={20} />
      <h3 className="font-bold uppercase tracking-wider text-sm">{title}</h3>
    </div>
    <div className="divide-y divide-slate-800/50">
      {data.map((team: any, idx: number) => (
        <div key={team.team_num} className="p-3 flex justify-between items-center hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <span className={`font-mono font-bold w-6 text-center ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-600'}`}>
              #{idx + 1}
            </span>
            <span className="font-bold text-slate-200">{team.team_num}</span>
          </div>
          <span className="font-mono text-slate-400">{team.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  </div>
);

export const TrendsPage = () => {
  const [rankings, setRankings] = useState<any>({
    total: [],
    auto: [],
    teleop: [],
    endgame: []
  });
  const [globalStats, setGlobalStats] = useState({ avgScore: 0, maxScore: 0 });
  const [loading, setLoading] = useState(true);

  // 1. Obtenemos la lista de equipos
  const { data: teamsList } = useQuery({ 
    queryKey: ['teams-list'], 
    queryFn: getTeamsList 
  });

  // 2. "Truco": Cargamos los datos de todos para armar el ranking
  // (En un app real masiva, esto se haría en el backend, pero para LAN está perfecto)
  useEffect(() => {
    const fetchAllData = async () => {
      if (!teamsList) return;
      
      try {
        const promises = teamsList.map(t => 
          apiClient.get<TeamOverview>(`/api/team/${t.team_num}/overview`)
        );
        
        const results = await Promise.all(promises);
        const allData = results.map(r => r.data);

        // Calcular Rankings
        const sortBy = (key: string, subKey?: string) => {
          return [...allData]
            .sort((a: any, b: any) => {
              const valA = subKey ? a[key][subKey] : a[key];
              const valB = subKey ? b[key][subKey] : b[key];
              return valB - valA;
            })
            .slice(0, 5) // Top 5
            .map((t: any) => ({
              team_num: t.team_num,
              value: subKey ? t[key][subKey] : t[key]
            }));
        };

        setRankings({
          total: sortBy('overall', 'avg_total_pts'),
          auto: sortBy('auto', 'avg_total_pts'),
          teleop: sortBy('teleop', 'avg_fuel_pts'),
          hang: sortBy('teleop', 'hang_success_rate'), // Ejemplo
        });

        // Calcular Stats Globales
        const totalAvg = allData.reduce((acc, curr) => acc + curr.overall.avg_total_pts, 0) / allData.length;
        const maxScore = Math.max(...allData.map(d => d.overall.avg_total_pts)); // Usamos promedio maximo como proxy

        setGlobalStats({ avgScore: totalAvg, maxScore });
        setLoading(false);

      } catch (err) {
        console.error("Error calculando rankings", err);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [teamsList]);

  if (loading) return <div className="p-10 text-center text-slate-500">Calculando estadísticas del evento...</div>;

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <TrendingUp className="text-indigo-500" /> Tendencias del Evento
        </h1>
        <p className="text-slate-400 mt-2">
          Análisis global y líderes del torneo.
        </p>
      </div>

      {/* GLOBAL STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                <Activity size={24} />
            </div>
            <div>
                <p className="text-slate-400 text-sm font-bold uppercase">Promedio del Evento</p>
                <p className="text-3xl font-black text-white">{globalStats.avgScore.toFixed(1)} <span className="text-sm font-normal text-slate-500">pts</span></p>
            </div>
        </div>

        <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
                <Trophy size={24} />
            </div>
            <div>
                <p className="text-slate-400 text-sm font-bold uppercase">Mejor OPR (Est.)</p>
                <p className="text-3xl font-black text-white">{globalStats.maxScore.toFixed(1)} <span className="text-sm font-normal text-slate-500">pts</span></p>
            </div>
        </div>
      </div>

      {/* LEADERBOARDS GRID */}
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Target size={20} className="text-slate-400" /> Líderes por Categoría
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LeaderboardCard 
          title="Top Puntuación" 
          icon={Trophy} 
          data={rankings.total} 
          colorClass="text-yellow-400 bg-yellow-400/5"
        />
        <LeaderboardCard 
          title="Top Autónomo" 
          icon={Zap} 
          data={rankings.auto} 
          colorClass="text-indigo-400 bg-indigo-400/5"
        />
        <LeaderboardCard 
          title="Top Teleop Fuel" 
          icon={Target} 
          data={rankings.teleop} 
          colorClass="text-emerald-400 bg-emerald-400/5"
        />
        {/* Puedes agregar más aquí */}
      </div>
    </div>
  );
};