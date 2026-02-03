import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, List, BarChart2, Activity } from 'lucide-react';
import { getTeamsList, getEventMetric } from '../../api/client';

// Visual Components
import { AnalysisTable } from '../../components/charts/AnalysisTable';
import { AnalysisScatter } from '../../components/charts/AnalysisScatter';
import { AnalysisRangeChart } from '../../components/charts/AnalysisRangeChart';

// --- CONFIGURACIÓN DE OPCIONES (ENGLISH) ---
const METRICS_OPTS = [
  { key: 'match_avg_total_pts', label: 'Total Avg' },
  { key: 'auto_total_pts', label: 'Auto Pts' },
  { key: 'tele_total_pts', label: 'Teleop Pts' },
  { key: 'tele_avg_fuel', label: 'Teleop Notes' }, // O "Game Pieces"
  { key: 'auto_success_rate', label: 'Auto Accuracy %' },
  { key: 'tele_hang_success_rate', label: 'Hang Success %' },
  { key: 'break_rate', label: 'Break Rate' },
];

export const AnalysisPage = () => {
  // 1. Load Team List
  const { data: teamsList } = useQuery({
    queryKey: ['teams-list'],
    queryFn: getTeamsList,
  });

  // --- VIEW STATES ---
  const [viewMode, setViewMode] = useState<'table' | 'scatter' | 'range'>('table');

  // State: Scatter Chart
  const [xVar, setXVar] = useState(METRICS_OPTS[1].key); // Default: Auto
  const [yVar, setYVar] = useState(METRICS_OPTS[2].key); // Default: Teleop
  const [scatterValueType, setScatterValueType] = useState<'avg' | 'max' | 'range'>('avg');

  // State: Range Chart
  const [rangeMetric, setRangeMetric] = useState(METRICS_OPTS[0].key); // Default: Total
  const [rangeSort, setRangeSort] = useState<'avg' | 'max' | 'consistency'>('avg');

  // ===========================================================================
  // DATA LOGIC: TABLE (God View Construction)
  // ===========================================================================
  const qTotal = useQuery({ queryKey: ['metric', 'match_avg_total_pts'], queryFn: () => getEventMetric('match_avg_total_pts') });
  const qAuto = useQuery({ queryKey: ['metric', 'auto_total_pts'], queryFn: () => getEventMetric('auto_total_pts') });
  const qTele = useQuery({ queryKey: ['metric', 'tele_total_pts'], queryFn: () => getEventMetric('tele_total_pts') });
  const qFuel = useQuery({ queryKey: ['metric', 'tele_avg_fuel'], queryFn: () => getEventMetric('tele_avg_fuel') });
  const qAutoRate = useQuery({ queryKey: ['metric', 'auto_success_rate'], queryFn: () => getEventMetric('auto_success_rate') });
  const qHangRate = useQuery({ queryKey: ['metric', 'tele_hang_success_rate'], queryFn: () => getEventMetric('tele_hang_success_rate') });
  const qBreak = useQuery({ queryKey: ['metric', 'break_rate'], queryFn: () => getEventMetric('break_rate') });

  const tableData = useMemo(() => {
    if (!teamsList) return [];

    const createMap = (query: any) => new Map(query.data?.data?.map((d: any) => [d.team_num, d.avg]) || []);
    
    const mapTotal = createMap(qTotal);
    const mapAuto = createMap(qAuto);
    const mapTele = createMap(qTele);
    const mapFuel = createMap(qFuel);
    const mapAutoRate = createMap(qAutoRate);
    const mapHangRate = createMap(qHangRate);
    const mapBreak = createMap(qBreak);

    return teamsList.map(t => ({
        team_num: t.team_num,
        nickname: t.nickname,
        total_avg: mapTotal.get(t.team_num) || 0,
        auto_avg: mapAuto.get(t.team_num) || 0,
        tele_avg: mapTele.get(t.team_num) || 0,
        fuel_avg: mapFuel.get(t.team_num) || 0,
        auto_success: mapAutoRate.get(t.team_num) || 0,
        hang_success: mapHangRate.get(t.team_num) || 0,
        break_rate: mapBreak.get(t.team_num) || 0,
    }));
  }, [teamsList, qTotal.data, qAuto.data, qTele.data, qFuel.data, qAutoRate.data, qHangRate.data, qBreak.data]);

  // ===========================================================================
  // DATA LOGIC: SCATTER CHART
  // ===========================================================================
  const isScatter = viewMode === 'scatter';

  const xQuery = useQuery({
    queryKey: ['event-metric', xVar],
    queryFn: () => getEventMetric(xVar),
    enabled: isScatter,
  });

  const yQuery = useQuery({
    queryKey: ['event-metric', yVar],
    queryFn: () => getEventMetric(yVar),
    enabled: isScatter,
  });

  const scatterData = useMemo(() => {
    if (!isScatter || !xQuery.data?.data || !yQuery.data?.data) return [];

    const yMap = new Map(yQuery.data.data.map((d: any) => [d.team_num, d]));

    return xQuery.data.data.map((xData: any) => {
      const yData = yMap.get(xData.team_num);
      if (!yData) return null;

      const getValue = (record: any) => {
          if (scatterValueType === 'range') return (record.max - record.min);
          return Number(record[scatterValueType]);
      };

      return {
        team_num: xData.team_num,
        name: `Team ${xData.team_num}`,
        x: getValue(xData),
        y: getValue(yData),
      };
    }).filter(Boolean);
  }, [xQuery.data, yQuery.data, scatterValueType, isScatter]);

  const xLabel = METRICS_OPTS.find(m => m.key === xVar)?.label || 'X Axis';
  const yLabel = METRICS_OPTS.find(m => m.key === yVar)?.label || 'Y Axis';
  const isLoadingScatter = isScatter && (xQuery.isLoading || yQuery.isLoading);

  // ===========================================================================
  // RENDER
  // ===========================================================================
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER & TOOLBAR */}
      <div className="flex flex-col xl:flex-row justify-between items-end border-b border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <BarChart2 className="text-indigo-500" /> Data Analysis
          </h1>
          <p className="text-slate-400">Competition data laboratory.</p>
        </div>

        {/* --- TOOLBAR --- */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-1.5 rounded-lg border border-slate-800">
            
            {/* 1. VIEW SELECTOR */}
            <div className="flex bg-slate-950 rounded-md p-1 border border-slate-800">
                <button onClick={() => setViewMode('table')} className={`p-2 rounded flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                    <List size={14} /> Table
                </button>
                <button onClick={() => setViewMode('scatter')} className={`p-2 rounded flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'scatter' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                    <LayoutGrid size={14} /> Scatter
                </button>
                <button onClick={() => setViewMode('range')} className={`p-2 rounded flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'range' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                    <Activity size={14} /> Ranges
                </button>
            </div>

            <div className="h-8 w-px bg-slate-800 mx-1 hidden sm:block"></div>

            {/* 2. DYNAMIC CONTROLS */}
            
            {/* SCATTER CONTROLS */}
            {viewMode === 'scatter' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                    <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5 mr-2">
                        {(['avg', 'max', 'range'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setScatterValueType(type)}
                                className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${scatterValueType === type ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <select value={xVar} onChange={(e) => setXVar(e.target.value)} className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1.5 outline-none focus:border-indigo-500 cursor-pointer">
                        {METRICS_OPTS.map(m => <option key={m.key} value={m.key}>X: {m.label}</option>)}
                    </select>
                    <span className="text-slate-600 font-bold text-xs">vs</span>
                    <select value={yVar} onChange={(e) => setYVar(e.target.value)} className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1.5 outline-none focus:border-indigo-500 cursor-pointer">
                        {METRICS_OPTS.map(m => <option key={m.key} value={m.key}>Y: {m.label}</option>)}
                    </select>
                </div>
            )}

            {/* RANGE CONTROLS */}
            {viewMode === 'range' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                     <select value={rangeMetric} onChange={(e) => setRangeMetric(e.target.value)} className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1.5 outline-none focus:border-indigo-500 min-w-[140px] cursor-pointer">
                        {METRICS_OPTS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                    </select>
                    <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5">
                        <button onClick={() => setRangeSort('avg')} className={`px-2 py-1 text-[10px] font-bold rounded ${rangeSort === 'avg' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>Avg</button>
                        <button onClick={() => setRangeSort('max')} className={`px-2 py-1 text-[10px] font-bold rounded ${rangeSort === 'max' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>Max</button>
                        <button onClick={() => setRangeSort('consistency')} className={`px-2 py-1 text-[10px] font-bold rounded ${rangeSort === 'consistency' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>Consist.</button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 min-h-0 bg-slate-900/40 border border-slate-800 rounded-xl p-0 overflow-hidden relative">
        
        {viewMode === 'table' && (
             <AnalysisTable data={tableData} />
        )}

        {viewMode === 'scatter' && (
             isLoadingScatter ? (
                 <div className="h-full flex items-center justify-center text-indigo-400 font-mono text-sm animate-pulse">Loading Scatter Data...</div>
             ) : (
                 <AnalysisScatter 
                    data={scatterData} 
                    xLabel={`${xLabel} (${scatterValueType})`} 
                    yLabel={`${yLabel} (${scatterValueType})`} 
                 />
             )
        )}

        {viewMode === 'range' && (
             <AnalysisRangeChart metricKey={rangeMetric} sortBy={rangeSort} />
        )}

      </div>
    </div>
  );
};