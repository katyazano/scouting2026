import { useParams } from 'react-router-dom';
import { Loader2, WifiOff, Wrench } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { MatchTrendChart } from '../../components/charts/MatchTrendChart'; // <--- Usamos la nueva gráfica
import { useTeamData } from '../../hooks/useTeamData';

export const TeamPage = () => {
  const { teamId } = useParams();
  const { metrics, trendData, isLoading, isError } = useTeamData(teamId || '');

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>;
  if (isError || !metrics) return <div className="flex justify-center p-20 text-red-400"><WifiOff size={40} /> <span className="ml-2">Error de conexión</span></div>;

  // CÁLCULOS EN EL FRONTEND
  // Calculamos el Break Rate manualmente: (Matches rotos / Total matches)
  const matchesBroken = metrics.advanced.reliability.broke.matches.length;
  const breakRate = matchesBroken / metrics.matches_played;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">FRC {teamId}</span>
            <span className="text-slate-400 text-sm">Matches: {metrics.matches_played}</span>
          </div>
          <h1 className="text-5xl font-black text-white">{teamId}</h1>
          <p className="text-slate-400">Equipo detectado</p>
        </div>
      </div>

      {/* KPIs - MAPEADOS AL JSON ANIDADO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Puntos Totales" 
          value={metrics.overall.avg_total_pts.toFixed(1)} 
          variant="accent"
        />
        <StatCard 
          label="Auto Avg" 
          value={metrics.auto.avg_total_pts.toFixed(1)} 
        />
        <StatCard 
          label="Teleop Fuel" 
          value={metrics.teleop.avg_fuel_pts.toFixed(1)} 
        />
        <StatCard 
          label="Fiabilidad" 
          value={`${((1 - breakRate) * 100).toFixed(0)}%`} 
          variant={breakRate > 0.2 ? 'danger' : 'success'}
          subtext={breakRate > 0.2 ? `Se rompió en ${matchesBroken} matches` : "Muy confiable"}
        />
      </div>

      {/* GRÁFICAS Y NOTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Nueva Gráfica de Tendencia */}
        <div className="lg:col-span-2">
           {trendData ? <MatchTrendChart data={trendData} /> : <p>Sin datos de historia</p>}
        </div>

        {/* Panel Lateral */}
        <div className="space-y-4">
            {metrics.advanced.reliability.currently_broken && (
              <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-start gap-3">
                  <Wrench className="text-red-400 shrink-0 mt-1" size={18} />
                  <div>
                    <h4 className="text-red-400 font-bold text-sm">REPORTE DE DAÑO</h4>
                    <p className="text-red-200/80 text-sm mt-1">
                      El robot terminó roto en su último match. Verificar estado antes de seleccionar.
                    </p>
                  </div>
              </div>
            )}

            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <h4 className="text-slate-400 font-bold text-xs uppercase mb-3">Estadísticas Clave</h4>
                <div className="text-sm text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Auto Success:</span>
                    <strong className="text-indigo-400">{(metrics.auto.success_rate * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Hang Success:</span>
                    <strong className="text-indigo-400">{(metrics.teleop.hang_success_rate * 100).toFixed(0)}%</strong>
                  </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};