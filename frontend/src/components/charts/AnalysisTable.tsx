import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';

interface Props {
  data: any[]; 
}

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: string; 
  direction: SortDirection;
}

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const AnalysisTable = ({ data }: Props) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'total_avg', direction: 'desc' });

  // --- ENGLISH COLUMNS ---
  const columns = [
    { key: 'team_num', label: 'Team', align: 'left' },
    { key: 'total_avg', label: 'Total Avg', align: 'center', highlight: true },
    { key: 'auto_avg', label: 'Auto Avg', align: 'center' },
    { key: 'tele_avg', label: 'Teleop Avg', align: 'center' },
    { key: 'fuel_avg', label: 'Notes Avg', align: 'center' },
    { key: 'auto_success', label: 'Auto %', align: 'center', isPercent: true },
    { key: 'hang_success', label: 'Hang %', align: 'center', isPercent: true },
    { key: 'break_rate', label: 'Break %', align: 'center', isPercent: true },
  ];

  const sortedData = useMemo(() => {
    if (!data) return [];
    
    return [...data].sort((a, b) => {
      const valA = getNestedValue(a, sortConfig.key) || 0;
      const valB = getNestedValue(b, sortConfig.key) || 0;

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-slate-900/40 border border-slate-800 rounded-xl">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full border-collapse min-w-[800px]">
          <thead className="bg-slate-950 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 text-slate-500 font-bold text-xs uppercase w-16 text-center">#</th>
              {columns.map((col) => (
                <th 
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`p-4 text-xs font-bold uppercase cursor-pointer transition-colors hover:text-indigo-400 select-none ${
                    sortConfig.key === col.key ? 'text-indigo-400' : 'text-slate-500'
                  } text-${col.align}`}
                >
                  <div className={`flex items-center gap-1 justify-${col.align === 'left' ? 'start' : 'center'}`}>
                    {col.label}
                    {sortConfig.key === col.key ? (
                      sortConfig.direction === 'desc' ? <ArrowDown size={12}/> : <ArrowUp size={12}/>
                    ) : (
                      <ArrowUpDown size={12} className="opacity-20"/>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-4 w-10"></th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-800/50">
            {sortedData.map((team, idx) => (
              <tr 
                key={team.team_num} 
                onClick={() => navigate(`/teams/${team.team_num}`)}
                className="hover:bg-indigo-500/5 transition-colors cursor-pointer group"
              >
                <td className="p-3 text-center text-slate-600 font-mono text-xs font-bold">
                  {idx + 1}
                </td>

                {columns.map((col) => {
                  const rawVal = getNestedValue(team, col.key);
                  let displayVal = typeof rawVal === 'number' ? rawVal.toFixed(1) : (rawVal || '-');
                  if (col.isPercent && typeof rawVal === 'number') displayVal = `${(rawVal * 100).toFixed(0)}%`;

                  return (
                    <td 
                      key={col.key} 
                      className={`p-3 text-sm font-mono text-${col.align} ${
                        col.highlight ? 'text-white font-bold' : 'text-slate-300'
                      }`}
                    >
                      {col.key === 'team_num' ? (
                        <span className="font-black text-indigo-300 group-hover:text-indigo-400 transition-colors text-base">
                          {displayVal}
                        </span>
                      ) : (
                        displayVal
                      )}
                    </td>
                  );
                })}

                <td className="p-3 text-slate-600 group-hover:text-indigo-400">
                  <ChevronRight size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-950 border-t border-slate-800 p-2 text-center text-[10px] text-slate-500 uppercase font-bold tracking-widest">
        Showing {sortedData.length} teams
      </div>
    </div>
  );
};