import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ErrorBar, ZAxis, ReferenceLine, Cell
} from 'recharts';
import { Loader2, AlertCircle, Activity } from 'lucide-react';
import { getEventMetric } from '../../api/client'; 

const DiamondShape = (props: any) => {
  const { cx, cy, fill } = props;
  const r = 5; 
  if (!cx || !cy) return null;
  return (
    <path d={`M ${cx},${cy - r} L ${cx + r},${cy} L ${cx},${cy + r} L ${cx - r},${cy} Z`} fill={fill} stroke="#fff" strokeWidth={1} />
  );
};

interface Props {
  metricKey: string;
  sortBy: 'avg' | 'max' | 'consistency';
}

export const AnalysisRangeChart = ({ metricKey, sortBy }: Props) => {
  
  const { data: metricData, isLoading, isError } = useQuery({
    queryKey: ['event-metric', metricKey],
    queryFn: () => getEventMetric(metricKey),
  });

  const { chartData, eventAverage } = useMemo(() => {
    if (!metricData?.data) return { chartData: [], eventAverage: 0 };
    
    const processed = metricData.data.map((d: any) => {
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

    const totalAvg = processed.reduce((acc: number, curr: any) => acc + curr.avg, 0) / (processed.length || 1);

    const sorted = processed.sort((a: any, b: any) => {
      if (sortBy === 'avg') return b.avg - a.avg;
      if (sortBy === 'max') return b.max - a.max;
      if (sortBy === 'consistency') return a.range - b.range; 
      return 0;
    });

    return { chartData: sorted, eventAverage: totalAvg };
  }, [metricData, sortBy]);

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
              <span>Range:</span> <span>{data.range.toFixed(1)} pts</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) return <div className="h-[600px] flex items-center justify-center text-indigo-500"><Loader2 className="animate-spin" size={48} /></div>;
  if (isError) return <div className="h-[600px] flex flex-col items-center justify-center text-red-400"><AlertCircle size={48} className="mb-2"/><p>Error loading metrics</p></div>;
  if (chartData.length === 0) return <div className="h-[600px] flex flex-col items-center justify-center text-slate-500"><Activity size={48} className="mb-2"/><p>No data available</p></div>;

  return (
    <div className="w-full h-[600px] relative animate-in fade-in duration-500">
       <ResponsiveContainer width="99%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 25, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="team_num" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }} interval={0} angle={-90} textAnchor="end" height={60} tickMargin={10} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} domain={[0, 'auto']} axisLine={false} tickLine={false} />
              <ZAxis range={[60, 60]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <ReferenceLine y={eventAverage} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'Event Avg', fill: '#ef4444', fontSize: 10 }} />
              <Scatter name="Rango" dataKey="avg" shape={<DiamondShape />} isAnimationActive={false}>
                <ErrorBar dataKey="errorRange" width={0} strokeWidth={6} stroke="#312e81" direction="y" />
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.avg >= eventAverage ? '#f97316' : '#94a3b8'} />
                ))}
              </Scatter>
              <Scatter dataKey="min" shape={() => <g />} legendType='none' />
              <Scatter dataKey="max" shape={() => <g />} legendType='none' />
            </ComposedChart>
       </ResponsiveContainer>
       
       <div className="absolute bottom-2 right-4 flex gap-4 text-[10px] text-slate-500 font-mono bg-slate-950/80 p-2 rounded border border-slate-800">
          <div className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rotate-45"></span> Team Avg</div>
          <div className="flex items-center gap-1"><span className="w-1 h-3 bg-indigo-900"></span> Range</div>
       </div>
    </div>
  );
};