import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface MatchData {
  match_num: number;
  match_type: string;
  auto_pts: number;
  tele_pts: number;
  total_pts: number;
  details?: any;
}

interface Props {
  data: MatchData[];
  onMatchClick?: (match: MatchData) => void;
}

// 1. TOOLTIP (Visualización)
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as MatchData;
    let titleColor = "text-slate-300";
    if (data.match_type === "Quals") titleColor = "text-indigo-300";
    else if (["Quarters", "Semis", "Finals", "Playoffs"].includes(data.match_type)) titleColor = "text-amber-300";

    return (
      <div className="bg-slate-950/90 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md min-w-[160px] z-50 pointer-events-none">
        <div className={`mb-3 border-b border-slate-800 pb-2 font-bold text-sm uppercase tracking-wide ${titleColor}`}>
            {data.match_type} {data.match_num}
        </div>
        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-indigo-400">
            <span>Auto:</span> <span className="font-bold">{data.auto_pts.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-emerald-400">
            <span>Teleop:</span> <span className="font-bold">{data.tele_pts.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-white font-bold border-t border-slate-800 pt-1 mt-1 text-sm">
            <span>Total:</span> <span>{data.total_pts.toFixed(0)} pts</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-center text-slate-500 italic">
            Click para detalles
        </div>
      </div>
    );
  }
  return null;
};

// 2. PUNTO ESTÁTICO (Siempre visible, pequeño)
const CustomizedDot = (props: any) => {
    const { cx, cy } = props;
    return (
      <circle 
        cx={cx} cy={cy} r={4} 
        fill="#6366f1" stroke="#1e1e2e" strokeWidth={2}
        className="transition-all duration-200"
      />
    );
};

// 3. PUNTO ACTIVO (HITBOX GIGANTE)
// Este componente se renderiza SOLO en la columna donde está el mouse.
const ActiveHitboxDot = (props: any) => {
    const { cx, cy, payload, onMatchClick } = props;
    
    return (
      <g 
        cursor="pointer"
        onClick={(e) => {
            e.stopPropagation(); // Detiene propagación
            console.log("🎯 HITBOX CLICK:", payload);
            if (onMatchClick) onMatchClick(payload);
        }}
      >
        {/* A. RECTÁNGULO INVISIBLE (EL TRUCO) */}
        {/* Dibuja un área clickeable desde arriba (y=0) hasta abajo (height=chartHeight) */}
        <rect 
            x={cx - 20} // 20px a la izquierda del punto
            y={0}       // Desde el techo de la gráfica
            width={40}  // 40px de ancho total para clickear fácil
            height={1000} // Altura exagerada para cubrir toda la gráfica
            fill="transparent" 
            className="outline-none"
        />

        {/* B. EL PUNTO VISUAL ACTIVO (BLANCO) */}
        <circle 
            cx={cx} cy={cy} r={7} 
            fill="#fff" stroke="#6366f1" strokeWidth={2} 
            pointerEvents="none" // Para que el click pase al rect de atrás si es necesario
        />
        
        {/* C. LÍNEA VERTICAL GUÍA (OPCIONAL, PERO AYUDA) */}
        <line 
            x1={cx} y1={0} x2={cx} y2={1000} 
            stroke="#6366f1" strokeWidth={1} strokeDasharray="4 4" opacity={0.5} 
            pointerEvents="none"
        />
      </g>
    );
};

export const MatchTrendChart = ({ data, onMatchClick }: Props) => {
  if (!data || data.length === 0) {
      return <div className="h-[350px] flex items-center justify-center text-slate-500">No data available</div>;
  }

  return (
    <div className="w-full h-[350px] bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          Trend Performance
        </h3>
      </div>
      
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            
            <XAxis 
              dataKey="match_num" 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
              tickLine={false} axisLine={false} interval="preserveStartEnd"
              tickFormatter={(val, index) => {
                  const type = data[index]?.match_type || '';
                  const prefix = type.includes('Practice') ? 'P' : type.includes('Qual') ? 'Q' : 'PL';
                  return `${prefix}${val}`;
              }}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
            
            {/* Quitamos el cursor del tooltip porque ahora lo dibujamos nosotros en el ActiveDot */}
            <Tooltip content={<CustomTooltip />} cursor={false} />
            
            <Area 
              type="monotone" 
              dataKey="total_pts" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTotal)"
              
              // 1. Punto estático (siempre visible)
              dot={<CustomizedDot />}
              
              // 2. Punto activo (HITBOX GIGANTE + VISUAL)
              activeDot={<ActiveHitboxDot onMatchClick={onMatchClick} />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};