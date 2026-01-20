import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, TrendingUp, Zap, Target, Activity, Loader2 } from 'lucide-react';
import { getTeamsList, getTeamOverview } from '../../api/client';

// Componente simple para las tarjetas
const LeaderboardCard = ({ title, icon: Icon, data, colorClass }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full hover:border-indigo-500/30 transition-colors">
    <div className={`p-4 border-b border-slate-800 flex items-center gap-2 ${colorClass}`}>
      <Icon size={20} />
      <h3 className="font-bold uppercase tracking-wider text-sm">{title}</h3>
    </div>
    <div className="divide-y divide-slate-800/50 flex-1 overflow-auto max-h-64 custom-scrollbar">
      {data.map((team: any, idx: number) => (
        <div key={team.team_num} className="p-3 flex justify-between items-center hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <span className={`font-mono font-bold w-6 text-center ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-600'}`}>
              #{idx + 1}
            </span>
            <span className="font-bold text-slate-200">{team.team_num}</span>
          </div>
          <span className="font-mono text-slate-400 font-medium">{Number(team.value).toFixed(1)}</span>
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
    hang: []
  });
  const [globalStats, setGlobalStats] = useState({ avgScore: 0, maxScore: 0 });
  const [loading, setLoading] = useState(true);

  // 1. Obtenemos la lista de equipos
  const { data: teamsList } = useQuery({ 
    queryKey: ['teams-list'], 
    queryFn: getTeamsList 
  });

  // 2. Calculamos los rankings al cargar la lista
  useEffect(() => {
    const fetchAllData = async () => {
      if (!teamsList || teamsList.length === 0) return;
      
      try {
        // Pedimos los datos de TODOS los equipos en paralelo
        const promises = teamsList.map(t => getTeamOverview(t.team_num));
        const allData = await Promise.all(promises);

        // Función auxiliar para ordenar
        const sortBy = (data: any[], key: string, subKey?: string) => {
          return [...data]
            .sort((a: any, b: any) => {
              const valA = subKey ? a[key]?.[subKey] ?? 0 : a[key] ?? 0;
              const valB = subKey ? b[key]?.[subKey] ?? 0 : b[key] ?? 0;
              return valB - valA;
            })
            .slice(0, 5) // Top 5
            .map((t: any) => ({
              team_num: t.team_num,
              value: subKey ? t[key]?.[subKey] ?? 0 : t[key] ?? 0
            }));
        };

        // Generamos los Top 5
        setRankings({
          total: sortBy(allData, 'overall', 'avg_total_pts'),
          auto: sortBy(allData, 'auto', 'avg_total_pts'),
          teleop: sortBy(allData, 'teleop', 'avg_fuel_pts'),
          hang: sortBy(allData, 'teleop', 'hang_success_rate'),
        });

        // Estadísticas Globales
        const totalPoints = allData.map((d: any) => d.overall?.avg_total_pts ?? 0);
        const avgScore = totalPoints.reduce((a, b) => a + b, 0) / (totalPoints.length || 1);
        const maxScore = Math.max(...totalPoints, 0);

        setGlobalStats({ avgScore, maxScore });
        setLoading(false);

      } catch (err) {
        console.error("Error calculando rankings:", err);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [teamsList]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-pulse">
        <Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
        <p>Analizando datos de {teamsList?.length || '...'} equipos...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500 overflow-y-auto pb-8">
      
      {/* HEADER */}
      <div className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <TrendingUp className="text-indigo-500" /> Tendencias del Evento
        </h1>
        <p className="text-slate-400 mt-2">
          Análisis global y líderes del torneo.
        </p>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS GLOBALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                <Activity size={24} />
            </div>
            <div>
                <p className="text-slate-400 text-sm font-bold uppercase">Promedio del Evento</p>
                <p className="text-4xl font-black text-white">{globalStats.avgScore.toFixed(1)} <span className="text-sm font-normal text-slate-500">pts</span></p>
            </div>
        </div>

        <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
                <Trophy size={24} />
            </div>
            <div>
                <p className="text-slate-400 text-sm font-bold uppercase">Mejor OPR (Est.)</p>
                <p className="text-4xl font-black text-white">{globalStats.maxScore.toFixed(1)} <span className="text-sm font-normal text-slate-500">pts</span></p>
            </div>
        </div>
      </div>

      {/* LEADERBOARDS (TOP 5) */}
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
        <LeaderboardCard 
          title="Mejores Colgando" 
          icon={Activity} 
          data={rankings.hang} 
          colorClass="text-cyan-400 bg-cyan-400/5"
        />
      </div>
    </div>
  );
};