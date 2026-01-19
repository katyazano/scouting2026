import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import type { MatchTrend } from '../../types';

interface MatchTrendChartProps {
  data: MatchTrend[];
}

export const MatchTrendChart = ({ data }: MatchTrendChartProps) => {
  return (
    <div className="w-full h-80 bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-slate-200 font-semibold flex items-center gap-2">
          📈 Tendencia por Match
        </h3>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="match_num" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            tickFormatter={(value) => `Q${value}`}
          />
          <YAxis 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            domain={[0, 'auto']}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
            itemStyle={{ color: '#818cf8' }}
            labelFormatter={(v) => `Qual ${v}`}
          />
          
          {/* Línea de Puntos */}
          <Line 
            type="monotone" 
            dataKey="match_total_pts" 
            stroke="#6366f1" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#1e293b', strokeWidth: 2, stroke: '#6366f1' }}
            activeDot={{ r: 6, fill: '#818cf8' }}
            name="Puntos Totales"
          />
          
          {/* Opcional: Línea de referencia del promedio */}
          <ReferenceLine y={47} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" label="Avg" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};