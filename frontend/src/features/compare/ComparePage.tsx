import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X, BarChart3, Plus, ArrowUpRight } from 'lucide-react';
import { getTeamsList, apiClient } from '../../api/client';
import type { TeamOverview } from '../../types';

export const ComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 1. INICIALIZACIÓN INTELIGENTE (Híbrida)
  const [selectedTeams, setSelectedTeams] = useState<number[]>(() => {
    // A. Intentamos leer de la URL primero (Prioridad Máxima para links compartidos)
    const urlParams = searchParams.get('teams');
    if (urlParams) {
      return urlParams.split(',').map(Number).filter(n => !isNaN(n));
    }
    
    // B. Si la URL está vacía, intentamos leer del LocalStorage (Memoria del navegador)
    try {
      const saved = localStorage.getItem('st_compare_teams');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error leyendo cache", e);
    }

    // C. Si no hay nada, empezamos vacíos
    return [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [teamData, setTeamData] = useState<Record<number, TeamOverview>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: allTeams } = useQuery({
    queryKey: ['teams-list'],
    queryFn: getTeamsList,
  });

  // 2. EFECTO: Sincronizar cambios a URL y LocalStorage
  useEffect(() => {
    // Guardar en URL (para compartir)
    if (selectedTeams.length > 0) {
      setSearchParams({ teams: selectedTeams.join(',') });
    } else {
      setSearchParams({});
    }

    // Guardar en LocalStorage (para persistencia al navegar)
    localStorage.setItem('st_compare_teams', JSON.stringify(selectedTeams));
    
  }, [selectedTeams, setSearchParams]);

  // 3. Cargar datos (igual que antes)
  useEffect(() => {
    selectedTeams.forEach(async (teamNum) => {
      if (!teamData[teamNum]) {
        try {
          const { data } = await apiClient.get<TeamOverview>(`/api/team/${teamNum}/overview`);
          setTeamData(prev => ({ ...prev, [teamNum]: data }));
        } catch (error) {
          console.error(`Error cargando equipo ${teamNum}`, error);
        }
      }
    });
  }, [selectedTeams, teamData]);

  const handleAddTeam = (teamNum: number) => {
    if (selectedTeams.includes(teamNum)) return;
    setSelectedTeams(prev => [...prev, teamNum]);
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const removeTeam = (teamNum: number) => {
    setSelectedTeams(prev => prev.filter(t => t !== teamNum));
  };

  // --- RESTO DEL CÓDIGO (Igual que antes) ---
  const searchResults = allTeams?.filter(t => 
    !selectedTeams.includes(t.team_num) && 
    t.team_num.toString().includes(searchTerm)
  ).slice(0, 5); 

  const parseValue = (val: string | number) => {
    if (typeof val === 'number') return val;
    return parseFloat(val.replace('%', ''));
  };

  const rows = [
    { id: 'matches', label: 'Matches', getValue: (d: TeamOverview) => d.matches_played },
    { id: 'pts', label: 'Puntos Totales', getValue: (d: TeamOverview) => d.overall.avg_total_pts.toFixed(1), highlight: true },
    { id: 'auto', label: 'Auto Avg', getValue: (d: TeamOverview) => d.auto.avg_total_pts.toFixed(1), highlight: true },
    { id: 'fuel', label: 'Teleop Fuel', getValue: (d: TeamOverview) => d.teleop.avg_fuel_pts.toFixed(1), highlight: true },
    { id: 'tele', label: 'Teleop Pts', getValue: (d: TeamOverview) => d.teleop.avg_total_pts.toFixed(1), highlight: true },
    { id: 'auto_s', label: 'Auto Success', getValue: (d: TeamOverview) => `${(d.auto.success_rate * 100).toFixed(0)}%`, highlight: true },
    { id: 'hang_s', label: 'Hang Success', getValue: (d: TeamOverview) => `${(d.teleop.hang_success_rate * 100).toFixed(0)}%`, highlight: true },
    { id: 'chasis', label: 'Chasis', getValue: (d: TeamOverview) => d.advanced?.latest?.chasis || '-', highlight: false },
  ];

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <BarChart3 className="text-indigo-500" /> Compare Teams
          </h1>
          <p className="text-slate-400">Analyze strengths and weaknesses side-by-side.</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm focus-within:shadow-indigo-500/20">
            <Search className="ml-3 text-slate-500" size={18} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Add team..." 
              className="w-full bg-transparent text-white px-3 py-2 outline-none placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {searchResults?.map(team => (
                <button
                  key={team.team_num}
                  onClick={() => handleAddTeam(team.team_num)}
                  className="w-full text-left px-4 py-3 hover:bg-indigo-600/20 hover:text-indigo-300 text-slate-300 flex justify-between items-center transition-colors border-b border-slate-700/50 last:border-0"
                >
                  <span className="font-bold">{team.team_num}</span>
                  <Plus size={16} />
                </button>
              ))}
              {searchResults?.length === 0 && (
                <div className="p-3 text-slate-500 text-sm text-center">Not found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ÁREA DE COMPARACIÓN */}
      {selectedTeams.length > 0 ? (
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="p-4 w-48 text-left text-slate-500 font-medium border-b border-slate-800 bg-slate-950/50 sticky left-0 z-10">
                  Metrics
                </th>
                
                {selectedTeams.map(teamNum => (
                  <th key={teamNum} className="p-4 border-b border-slate-800 min-w-[180px] relative group">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-white mb-1">{teamNum}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => removeTeam(teamNum)}
                          className="text-slate-600 hover:text-red-400 transition-colors p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {rows.map((row, idx) => {
                let maxValue = -1;
                if (row.highlight) {
                   const values = selectedTeams.map(t => {
                       const data = teamData[t];
                       return data ? parseValue(row.getValue(data)) : -1;
                   });
                   maxValue = Math.max(...values);
                }

                return (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors border-b border-slate-800/50 last:border-0 group/row">
                    <td className="p-4 text-slate-400 font-medium text-sm sticky left-0 bg-slate-950 z-10 border-r border-slate-900/50 group-hover/row:text-slate-200 transition-colors">
                      {row.label}
                    </td>

                    {selectedTeams.map(teamNum => {
                      const data = teamData[teamNum];
                      const displayValue = data ? row.getValue(data) : null;
                      const numericValue = data ? parseValue(displayValue!) : -1;
                      const isWinner = row.highlight && data && numericValue === maxValue && maxValue > 0;

                      return (
                        <td key={`${teamNum}-${idx}`} className="p-4 text-center relative">
                          {isWinner && (
                              <div className="absolute inset-0 bg-emerald-500/5 border-x border-emerald-500/10 pointer-events-none" />
                          )}
                          
                          {data ? (
                            <span className={`text-lg font-mono relative z-10 ${
                                isWinner ? 'text-emerald-400 font-black drop-shadow-sm' : 'text-slate-300'
                            }`}>
                              {displayValue}
                              {isWinner && <span className="text-[10px] ml-1 text-emerald-500 align-top">▲</span>}
                            </span>
                          ) : (
                            <div className="h-4 w-12 bg-slate-800 rounded animate-pulse mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl m-4 bg-slate-900/20">
          <button 
            onClick={() => searchInputRef.current?.focus()}
            className="group relative bg-slate-800 p-8 rounded-full mb-6 hover:bg-indigo-600 transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-indigo-500/40 cursor-pointer border border-slate-700 hover:border-indigo-400"
          >
            <BarChart3 size={48} className="text-slate-500 group-hover:text-white transition-colors duration-300" />
            <div className="absolute -top-2 -right-2 bg-indigo-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
               <ArrowUpRight size={16} />
            </div>
          </button>
          
          <h3 className="text-2xl font-bold text-slate-300 mb-2">Start Comparing</h3>
          <p className="max-w-md text-center mb-8 text-slate-500">
            Click the button or use the top bar to add teams to the comparison.
          </p>
        </div>
      )}
    </div>
  );
};