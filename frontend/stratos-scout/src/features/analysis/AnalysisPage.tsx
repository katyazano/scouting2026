import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ErrorBar, ZAxis
} from 'recharts';
import { BarChart2, Filter, Loader2, AlertCircle } from 'lucide-react';
import { getEventMetric } from '../../api/client';

// Configuración de las métricas
const METRIC_OPTIONS = [
  { key: 'match_avg_total_pts', label: 'Promedio Total (Match)' },
  { key: 'auto_total_pts', label: 'Puntos Autónomo' },
  { key: 'tele_total_pts', label: 'Puntos Teleop Total' },
  { key: 'tele_avg_fuel', label: 'Teleop Fuel (Pelotas)' },
  { key: 'auto_success_rate', label: '% Éxito Auto (Active)' },
  { key: 'auto_hang_success_rate', label: '% Éxito Hang Auto' },
  { key: 'tele_hang_success_rate', label: '% Éxito Hang Teleop' },
  { key: 'break_rate', label: 'Tasa de Rotura (Break Rate)' },
];

// --- INTERFAZ PARA LOS DATOS DEL GRÁFICO (CORRECCIÓN 1) ---
interface ChartDataPoint {
  team_num: number;
  avg: number;
  min: number;
  max: number;
  errorRange: [number, number]; // Tupla de dos números
}

// --- FIGURAS PERSONALIZADAS ---

const DiamondShape = (props: any) => {
  const { cx, cy } = props;
  const r = 6; 
  if (!cx || !cy) return null;
  return (
    <path 
      d={`M ${cx},${cy - r} L ${cx + r},${cy} L ${cx},${cy + r} L ${cx - r},${cy} Z`} 
      fill="#f97316" stroke="#fff" strokeWidth={1}
    />
  );
};

const SquareShape = (props: any) => {
  const { cx, cy } = props;
  const s = 10;
  if (!cx || !cy) return null;
  return <rect x={cx - s/2} y={cy - s/2} width={s} height={s} fill="#1e3a8a" />;
};

export const AnalysisPage = () => {
  const [selectedMetric, setSelectedMetric] = useState(METRIC_OPTIONS[0]);

  const { data: metricData, isLoading, isError } = useQuery({
    queryKey: ['event-metric', selectedMetric.key],
    queryFn: () => getEventMetric(selectedMetric.key),
  });

  // 2. Procesamiento de Datos
  const chartData = useMemo(() => {
    if (!metricData?.data) return [];
    
    // CORRECCIÓN 1: Tipamos explícitamente la variable 'processed'
    const processed: ChartDataPoint[] = metricData.data.map((d: any) => {
      const avg = Number(d.avg);
      const min = Number(d.min);
      const max = Number(d.max);

      return {
        team_num: d.team_num,
        avg: avg,
        min: min,
        max: max,
        errorRange: [avg - min, max - avg] 
      };
    });

    // Ahora TypeScript sabe que 'a' y 'b' son de tipo ChartDataPoint
    return processed.sort((a, b) => b.avg - a.avg);
  }, [metricData]);

  // Debugging
  console.log("Datos para gráfica:", chartData);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl z-50">
          <p className="font-black text-lg text-white mb-2 border-b border-slate-800 pb-1">Equipo {label}</p>
          <div className="space-y-1 text-sm font-mono">
            <div className="flex justify-between gap-4 text-indigo-300">
              <span>Max:</span> <span className="font-bold">{data.max.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4 text-orange-400 font-bold bg-orange-400/10 px-1 rounded">
              <span>Avg:</span> <span>{data.avg.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4 text-blue-400">
              <span>Min:</span> <span className="font-bold">{data.min.toFixed(1)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500">
      
      {/* HEADER (Sin cambios) */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <BarChart2 className="text-indigo-500" /> Análisis de Rangos
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
             <span className="w-3 h-3 bg-orange-500 rotate-45 inline-block"></span> Promedio
             <span className="w-1 h-3 bg-blue-900 inline-block ml-2"></span> Rango (Min-Max)
          </p>
        </div>

        <div className="w-full md:w-72">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
            <Filter size={14} /> Seleccionar Métrica
          </label>
          <select 
            className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
        </div>
      </div>

      {/* ÁREA DEL GRÁFICO - CORREGIDA */}
      {/* CORRECCIÓN: Usamos h-[600px] (altura fija) en lugar de min-h.
          Esto asegura que ResponsiveContainer sepa exactamente cuánto es "100%" */}
      <div className="w-full h-[600px] bg-slate-900/50 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-indigo-400 z-20 bg-slate-900/50">
            <Loader2 className="animate-spin" size={48} />
          </div>
        )}

        {isError && (
           <div className="flex flex-col items-center justify-center h-full text-red-400">
             <AlertCircle size={48} className="mb-2"/>
             <p>Error cargando datos del servidor.</p>
           </div>
        )}

        {!isLoading && !isError && chartData.length === 0 && (
           <div className="flex items-center justify-center h-full text-slate-500">
             No hay datos para mostrar en esta métrica.
           </div>
        )}

        {!isLoading && chartData.length > 0 && (
          // Usamos 99% en width para evitar problemas de redondeo en flexbox
          <ResponsiveContainer width="99%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              
              <XAxis 
                dataKey="team_num" 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} 
                interval={0} 
                angle={-90}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                domain={[0, 'auto']}
              />
              <ZAxis range={[60, 60]} />
              
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />

              <Scatter dataKey="avg" shape={<DiamondShape />} isAnimationActive={false}>
                <ErrorBar 
                  dataKey="errorRange" 
                  width={0} 
                  strokeWidth={8} 
                  stroke="#1e3a8a" 
                  direction="y"
                />
              </Scatter>

              <Scatter dataKey="min" shape={<SquareShape />} isAnimationActive={false} legendType='none' />
              <Scatter dataKey="max" shape={<SquareShape />} isAnimationActive={false} legendType='none' />

            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};