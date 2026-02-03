import { useNavigate } from 'react-router-dom';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts';

interface ScatterPoint {
  team_num: number;
  x: number;
  y: number;
  name: string; 
}

interface Props {
  data: ScatterPoint[];
  xLabel: string;
  yLabel: string;
}

const CustomTooltip = ({ active, payload, xLabel, yLabel }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl z-50 pointer-events-none">
        <div className="font-black text-indigo-400 text-lg mb-2">Team {data.team_num}</div>
        <div className="text-xs text-slate-300 space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">{xLabel}:</span> 
            <span className="font-mono font-bold">{data.x.toFixed(1)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">{yLabel}:</span> 
            <span className="font-mono font-bold">{data.y.toFixed(1)}</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 italic">Click to view details</div>
      </div>
    );
  }
  return null;
};

const RenderTeamShape = (props: any) => {
  const { cx, cy, payload, onClick } = props;
  if (!cx || !cy) return null;

  return (
    <g onClick={onClick} className="cursor-pointer hover:opacity-80 transition-opacity">
      <circle cx={cx} cy={cy} r={14} fill="#312e81" fillOpacity={0.8} stroke="#6366f1" strokeWidth={1} />
      <text x={cx} y={cy} dy={4} textAnchor="middle" fill="#fff" fontSize={10} fontWeight="bold" pointerEvents="none">
        {payload.team_num}
      </text>
    </g>
  );
};

export const AnalysisScatter = ({ data, xLabel, yLabel }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-[600px] bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col select-none animate-in fade-in zoom-in-95 duration-300">
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" dataKey="x" name={xLabel} tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#475569' }}>
              <Label value={xLabel} offset={0} position="insideBottom" fill="#64748b" fontSize={14} dy={20} />
            </XAxis>
            <YAxis type="number" dataKey="y" name={yLabel} tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#475569' }}>
               <Label value={yLabel} angle={-90} position="insideLeft" fill="#64748b" fontSize={14} dx={-10} />
            </YAxis>
            <Tooltip content={<CustomTooltip xLabel={xLabel} yLabel={yLabel} />} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />
            <Scatter 
              name="Teams" data={data} shape={<RenderTeamShape />}
              onClick={(node: any) => {
                 const teamNum = node?.payload?.team_num || node?.team_num;
                 if (teamNum) navigate(`/teams/${teamNum}`);
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};