import { useParams } from 'react-router-dom';
import { Share2, AlertTriangle, Loader2, WifiOff, Wrench, Cpu, Anchor, Box, Crosshair } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { MatchTrendChart } from '../../components/charts/MatchTrendChart';
import { useTeamData } from '../../hooks/useTeamData';

export const TeamPage = () => {
  const { teamId } = useParams();
  const { metrics, trendData, isLoading, isError } = useTeamData(teamId || '');

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>;
  if (isError || !metrics) return <div className="flex justify-center p-20 text-red-400"><WifiOff size={40} /> <span className="ml-2">Error de conexión</span></div>;

  // Cálculos auxiliares
  const matchesBroken = metrics.advanced.reliability.broke.matches.length;
  const breakRate = matchesBroken / metrics.matches_played;
  
  // Accesos directos para escribir menos código (Destructuring)
  const robot = metrics.advanced.latest; 

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER CON ETIQUETAS DE ROBOT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-6 gap-4">
        <div className="w-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">FRC {teamId}</span>
            <span className="text-slate-400 text-sm">Matches: {metrics.matches_played}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Número Gigante */}
            <h1 className="text-5xl font-black text-white">{teamId}</h1>
            
            {/* --- ZONA DE ETIQUETAS (TAGS) --- */}
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-indigo-300 flex items-center gap-1 uppercase">
                    <Cpu size={12} /> {robot.chasis}
                </span>

                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300 flex items-center gap-1 uppercase">
                    <Box size={12} /> {robot.intake} intake
                </span>

                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300 flex items-center gap-1 uppercase">
                    <Crosshair size={12} /> {robot.shooter.raw} shooter
                </span>

                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 border-dashed">
                    HOPPER: {robot.hopper_capacity}
                </span>

                {robot.climber ? (
                    <span className="px-2 py-1 rounded bg-blue-900/30 border border-blue-500/30 text-xs font-bold text-blue-200 flex items-center gap-1 uppercase">
                        <Anchor size={12} /> Climber
                    </span>
                ) : (
                    <span className="px-2 py-1 rounded bg-red-900/10 border border-red-500/20 text-xs text-red-400/50 line-through decoration-red-500/50">
                        No Climb
                    </span>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* RESTO DEL DASHBOARD (KPIs y Gráficas) */}
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
          subtext={breakRate > 0.2 ? `Roto en ${matchesBroken} matches` : "Muy confiable"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           {trendData ? <MatchTrendChart data={trendData} /> : <p>Sin datos de historia</p>}
        </div>

        <div className="space-y-4">
            {metrics.advanced.reliability.currently_broken && (
              <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-start gap-3">
                  <Wrench className="text-red-400 shrink-0 mt-1" size={18} />
                  <div>
                    <h4 className="text-red-400 font-bold text-sm">REPORTE DE DAÑO</h4>
                    <p className="text-red-200/80 text-sm mt-1">
                      El robot terminó roto en su último match. Verificar estado.
                    </p>
                  </div>
              </div>
            )}

            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <h4 className="text-slate-400 font-bold text-xs uppercase mb-3">Estadísticas Clave</h4>
                <div className="text-sm text-slate-300 space-y-2">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span>Auto Success:</span>
                    <strong className="text-indigo-400">{(metrics.auto.success_rate * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="flex justify-between pt-1">
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