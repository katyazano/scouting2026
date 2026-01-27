import { useParams } from 'react-router-dom';
import { 
  Loader2, WifiOff, Wrench, Cpu, Box, Crosshair, 
  AlertTriangle, CheckCircle2, Anchor, Activity, History, MessageSquare 
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { MatchTrendChart } from '../../components/charts/MatchTrendChart';
import { useTeamData } from '../../hooks/useTeamData';

export const TeamPage = () => {
  const { teamId } = useParams();
  const { metrics, trendData, isLoading, isError } = useTeamData(teamId || '');

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>;
  if (isError || !metrics) return <div className="flex justify-center p-20 text-red-400"><WifiOff size={40} /> <span className="ml-2">Connection error</span></div>;

  // Cálculos auxiliares
  const matchesBroken = metrics.advanced.reliability.broke.matches.length;
  const breakRate = matchesBroken / metrics.matches_played;
  const reliabilityScore = (1 - breakRate) * 100;
  
  // Accesos directos
  const robot = metrics.advanced.latest; 
  const reliability = metrics.advanced.reliability;
  const typical = metrics.advanced.typical;

  // Determinar color de salud
  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-500";
    if (score >= 70) return "text-yellow-400 bg-yellow-500";
    return "text-red-400 bg-red-500";
  };
  const healthColor = getHealthColor(reliabilityScore);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-6 gap-4">
        <div className="w-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">FRC {teamId}</span>
            <span className="text-slate-400 text-sm">Matches: {metrics.matches_played}</span>
            
            {reliability.currently_broken ? (
               <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-900/20 px-2 py-0.5 rounded border border-red-500/30">
                 <AlertTriangle size={10} /> BROKEN
               </span>
             ) : (
               <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-500/30">
                 <CheckCircle2 size={10} /> FUNCTIONAL
               </span>
             )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-5xl font-black text-white">{teamId}</h1>
            
            {/* --- TAGS DEL ROBOT --- */}
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-indigo-300 flex items-center gap-1 uppercase">
                    <Cpu size={12} /> {robot.chasis}
                </span>
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300 flex items-center gap-1 uppercase">
                    <Box size={12} /> {robot.intake}
                </span>
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300 flex items-center gap-1 uppercase">
                    <Crosshair size={12} /> {robot.shooter.raw}
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

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Points" value={metrics.overall.avg_total_pts.toFixed(1)} variant="accent" />
        <StatCard label="Auto Avg" value={metrics.auto.avg_total_pts.toFixed(1)} />
        <StatCard label="Teleop Fuel" value={metrics.teleop.avg_fuel_pts.toFixed(1)} />
      </div>

      {/* --- CHART Y SIDEBAR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           {trendData ? <MatchTrendChart data={trendData} /> : <div className="p-10 text-slate-500 text-center border border-dashed border-slate-800 rounded-xl">Sin historial</div>}
           
           {/* --- NUEVA SECCIÓN: SCOUT LOG (COMENTARIOS) --- */}
           <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center gap-2">
                <MessageSquare size={16} className="text-indigo-400" />
                <h3 className="font-bold text-white text-sm uppercase">Scout Log</h3>
                <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full border border-slate-700">
                  {metrics.comments?.length || 0} Notes
                </span>
              </div>
              
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {metrics.comments && metrics.comments.length > 0 ? (
                  metrics.comments.map((comment: any, idx: number) => (
                    <div key={idx} className="flex gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                      {/* Avatar Simulado con Iniciales */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold">
                        {comment.scouter ? comment.scouter.substring(0,2).toUpperCase() : "??"}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-slate-300">{comment.scouter}</span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            Match {comment.match_num}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed italic">"{comment.text}"</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-600 italic">
                    No comments logged for this team.
                  </div>
                )}
              </div>
           </div>

        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">
            
            {/* NUEVO DISEÑO: TARJETA DE SALUD DEL ROBOT */}
            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-slate-400 font-bold text-s uppercase flex items-center gap-2">
                        <Activity size={20} className={healthColor.split(" ")[0]} /> Reliability
                    </h4>
                    <span className={`text-2xl font-black ${healthColor.split(" ")[0]}`}>
                        {reliabilityScore.toFixed(0)}%
                    </span>
                 </div>

                 {/* BARRA DE PROGRESO VISUAL */}
                 <div className="w-full h-3 bg-slate-800 rounded-full mb-2 overflow-hidden border border-slate-700">
                    <div 
                        className={`h-full ${healthColor.split(" ")[1]} transition-all duration-1000 ease-out`} 
                        style={{ width: `${reliabilityScore}%` }}
                    />
                 </div>
                 
                 {/* HISTORIAL INTEGRADO */}
                 <div className="border-t border-slate-800/50 pt-4">
                     <h5 className="text-slate-500 text-s font-bold uppercase mb-3 flex items-center gap-2">
                        <History size={14} /> Broken record
                     </h5>
                     
                     {(reliability.broke.matches.length === 0 && reliability.fixed.matches.length === 0) ? (
                        <div className="text-center py-2 bg-emerald-900/5 border border-emerald-500/10 rounded-lg">
                            <span className="text-emerald-400/70 text-xs italic">No broken incidents</span>
                        </div>
                     ) : (
                       <div className="space-y-3">
                         {reliability.broke.matches.length > 0 && (
                           <div className="flex items-start gap-3">
                             <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0"></div>
                             <div>
                               <p className="text-[15px] text-red-300 font-medium">Broke in:</p>
                               <div className="flex flex-wrap gap-1 mt-1">
                                 {reliability.broke.matches.map(m => (
                                   <span key={m} className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[12px] font-mono rounded border border-red-500/20">Q{m}</span>
                                 ))}
                               </div>
                             </div>
                           </div>
                         )}
                         
                         {reliability.fixed.matches.length > 0 && (
                           <div className="flex items-start gap-3">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                             <div>
                               <p className="text-[15px] text-emerald-300 font-medium">Repaired in:</p>
                               <div className="flex flex-wrap gap-1 mt-1">
                                 {reliability.fixed.matches.map(m => (
                                   <span key={m} className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[12px] font-mono rounded border border-emerald-500/20">Q{m}</span>
                                 ))}
                               </div>
                             </div>
                           </div>
                         )}
                       </div>
                     )}
                 </div>

                 {/* Alerta si está roto actualmente */}
                 {reliability.currently_broken && (
                   <div className="mt-4 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex gap-3 items-center">
                       <AlertTriangle className="text-red-400 shrink-0" size={16} />
                       <span className="text-red-300 text-[14px] font-medium">The robot is broken</span>
                   </div>
                 )}
            </div>

            {/* ESTADÍSTICAS CLAVE */}
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <h4 className="text-slate-400 font-bold text-xs uppercase mb-3">Key Statistics</h4>
                <div className="text-sm text-slate-300 space-y-2">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span>Auto Success:</span>
                    <strong className="text-indigo-400">{(metrics.auto.success_rate * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span>Hang Success:</span>
                    <strong className="text-indigo-400">{(metrics.teleop.hang_success_rate * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span>Rol preferido:</span>
                    <strong className="text-cyan-400 uppercase">{typical.role || "N/A"}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span>Climb Level:</span>
                    <strong className="text-white">
                        {metrics.teleop.mode_climb_level > 0 
                            ? `Level ${metrics.teleop.mode_climb_level}` 
                            : "No climb"}
                    </strong>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Crossing obstacles:</span>
                    <strong className="text-white uppercase">{typical.trench || "N/A"}</strong>
                  </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};