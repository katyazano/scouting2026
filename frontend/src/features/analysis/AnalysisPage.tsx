import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ErrorBar, ZAxis, ReferenceLine, Cell
} from 'recharts';
import { BarChart2, Filter, Loader2, AlertCircle, ArrowUpDown, Activity } from 'lucide-react';
import { getEventMetric } from '../../api/client';

// Opciones de Métricas (Asegúrate que coincidan con las columnas de tu CSV/Backend)
const METRIC_OPTIONS = [
  { key: 'match_avg_total_pts', label: 'Promedio Total (Match)' },
  { key: 'auto_total_pts', label: 'Puntos Autónomo Total' },
  { key: 'tele_total_pts', label: 'Puntos Teleop Total' },
  { key: 'tele_avg_fuel', label: 'Teleop Fuel (Solo Notas)' },
  { key: 'tele_hang_success_rate', label: '% Éxito Escalada' },
  { key: 'auto_success_rate', label: '% Éxito Autónomo' },
  { key: 'break_rate', label: 'Tasa de Rotura' },
];

interface ChartDataPoint {
  team_num: number;
  avg: number;
  min: number;
  max: number;
  range: number; // Diferencia Max - Min
  errorRange: [number, number]; // Para la barra de error
}

// --- FIGURAS PERSONALIZADAS ---
const DiamondShape = (props: any) => {
  const { cx, cy, fill } = props;
  const r = 5; 
  if (!cx || !cy) return null;
  return (
    <path 
      d={`M ${cx},${cy - r} L ${cx + r},${cy} L ${cx},${cy + r} L ${cx - r},${cy} Z`} 
      fill={fill} stroke="#fff" strokeWidth={1}
    />
  );
};

export const AnalysisPage = () => {
  const [selectedMetric, setSelectedMetric] = useState(METRIC_OPTIONS[0]);
  const [sortBy, setSortBy] = useState<'avg' | 'max' | 'consistency'>('avg');

  const { data: metricData, isLoading, isError } = useQuery({
    queryKey: ['event-metric', selectedMetric.key],
    // Asegúrate de que tu backend soporte pedir métricas individuales o ajusta esto
    queryFn: () => getEventMetric(selectedMetric.key),
  });

  // Procesamiento de Datos
  const { chartData, eventAverage } = useMemo(() => {
    if (!metricData?.data) return { chartData: [], eventAverage: 0 };
    
    const processed: ChartDataPoint[] = metricData.data.map((d: any) => {
      const avg = Number(d.avg);
      const min = Number(d.min);
      const max = Number(d.max);
      return {
        team_num: d.team_num,
        avg: avg,
        min: min,
        max: max,
        range: max - min,
        errorRange: [avg - min, max - avg] 
      };
    });

    // Calcular promedio global del evento para la línea de referencia
    const totalAvg = processed.reduce((acc, curr) => acc + curr.avg, 0) / (processed.length || 1);

    // Lógica de Ordenamiento
    const sorted = processed.sort((a, b) => {
      if (sortBy === 'avg') return b.avg - a.avg;
      if (sortBy === 'max') return b.max - a.max;
      if (sortBy === 'consistency') return a.range - b.range; // Menor rango = Más consistente
      return 0;
    });

    return { chartData: sorted, eventAverage: totalAvg };
  }, [metricData, sortBy]);

  // Tooltip Personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md z-50 min-w-[180px]">
          <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
             <span className="font-black text-lg text-white">Team {label}</span>
             <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded uppercase">Rank #{chartData.indexOf(data) + 1}</span>
          </div>
          
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-emerald-400">
              <span>Max:</span> <span className="font-bold">{data.max.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">
              <span>Avg:</span> <span>{data.avg.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>Min:</span> <span className="font-bold">{data.min.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-1 mt-1 border-t border-slate-800">
              <span>Variability:</span> <span>{data.range.toFixed(1)} pts</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500 pb-10">
      
      {/* --- HEADER DE CONTROLES --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-6 border-b border-slate-800 pb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <BarChart2 className="text-indigo-500" /> Comparativa de Equipos
          </h1>
          <p className="text-slate-400 mt-1 text-sm max-w-2xl">
            Analiza el rango de rendimiento de cada equipo. La <span className="text-indigo-400 font-bold">barra azul</span> representa la variabilidad entre su peor y mejor match. El <span className="text-orange-500 font-bold">rombo</span> es su promedio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          
          {/* Selector de Métrica */}
          <div className="w-full sm:w-64">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
              <Filter size={12} /> Métrica
            </label>
            <div className="relative">
              <select 
                className="w-full bg-slate-900 border border-slate-700 text-white text-sm p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer hover:border-slate-600 transition-colors"
                value={selectedMetric.key}
                onChange={(e) => {
                  const metric = METRIC_OPTIONS.find(m => m.key === e.target.value);
                  if (metric) setSelectedMetric(metric);
                }}
              >
                {METRIC_OPTIONS.map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
                <ArrowUpDown size={14} />
              </div>
            </div>
          </div>

          {/* Botones de Ordenamiento */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
              <ArrowUpDown size={12} /> Ordenar por
            </label>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                <button 
                  onClick={() => setSortBy('avg')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === 'avg' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Promedio
                </button>
                <button 
                  onClick={() => setSortBy('max')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === 'max' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Potencial (Max)
                </button>
                <button 
                  onClick={() => setSortBy('consistency')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === 'consistency' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Consistencia
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- GRÁFICO PRINCIPAL --- */}
      <div className="w-full h-[600px] bg-slate-900/40 border border-slate-800 rounded-2xl p-2 relative overflow-hidden shadow-inner">
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-indigo-400 z-20 bg-slate-950/80 backdrop-blur-sm">
            <Loader2 className="animate-spin" size={48} />
          </div>
        )}

        {isError && (
           <div className="flex flex-col items-center justify-center h-full text-red-400">
             <AlertCircle size={48} className="mb-4 opacity-50"/>
             <p className="font-bold">Error cargando datos</p>
             <p className="text-sm opacity-70">Verifica la conexión con el servidor</p>
           </div>
        )}

        {!isLoading && !isError && chartData.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <Activity size={48} className="mb-4 opacity-20"/>
             <p>No hay datos disponibles para esta métrica.</p>
           </div>
        )}

        {!isLoading && chartData.length > 0 && (
          <ResponsiveContainer width="99%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 25, right: 30, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              
              <XAxis 
                dataKey="team_num" 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }} 
                interval={0} 
                angle={-90}
                textAnchor="end"
                height={60}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} 
                domain={[0, 'auto']}
                axisLine={false}
                tickLine={false}
              />
              <ZAxis range={[60, 60]} />
              
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              
              {/* Línea de Promedio del Evento */}
              <ReferenceLine y={eventAverage} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'center', value: 'Event Avg', fill: '#ef4444', fontSize: 10 }} />

              {/* Barra de Error (El Rango) */}
              <Scatter name="Rango" dataKey="avg" shape={<DiamondShape />} isAnimationActive={false}>
                <ErrorBar 
                  dataKey="errorRange" 
                  width={0} 
                  strokeWidth={6} 
                  stroke="#312e81"  // Color base de la barra (Indigo muy oscuro)
                  direction="y"
                />
                {/* Colorear los rombos según desempeño respecto al promedio del evento */}
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.avg >= eventAverage ? '#f97316' : '#94a3b8'} />
                ))}
              </Scatter>

              {/* Topes Min y Max (Puntos pequeños para referencia visual) */}
              <Scatter dataKey="min" shape={() => <g />} legendType='none' />
              <Scatter dataKey="max" shape={() => <g />} legendType='none' />

            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 flex gap-6 justify-center text-xs text-slate-500 font-mono">
         <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-orange-500 rotate-45"></span> Promedio del Equipo
         </div>
         <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-900"></span> Rango de Rendimiento
         </div>
         <div className="flex items-center gap-2">
            <span className="w-4 h-[1px] border-t border-dashed border-red-500"></span> Promedio del Evento
         </div>
      </div>
    </div>
  );
};