import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, BarChart3, Plus } from 'lucide-react';
import { getTeamsList } from '../../api/client';
import type { TeamOverview } from '../../types';
import {apiClient } from '../../api/client'; 

export const ComparePage = () => {
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamData, setTeamData] = useState<Record<number, TeamOverview>>({});

  // 1. Cargar lista para el buscador
  const { data: allTeams } = useQuery({
    queryKey: ['teams-list'],
    queryFn: getTeamsList,
  });

  // 2. Función para agregar
  const handleAddTeam = async (teamNum: number) => {
    if (selectedTeams.includes(teamNum)) return;
    
    const newSelection = [...selectedTeams, teamNum];
    setSelectedTeams(newSelection);
    setSearchTerm(''); 

    if (!teamData[teamNum]) {
      try {
        const { data } = await apiClient.get<TeamOverview>(`/api/team/${teamNum}/overview`);
        setTeamData(prev => ({ ...prev, [teamNum]: data }));
      } catch (error) {
        console.error(`Error cargando equipo ${teamNum}`, error);
      }
    }
  };

  const removeTeam = (teamNum: number) => {
    setSelectedTeams(prev => prev.filter(t => t !== teamNum));
  };

  const searchResults = allTeams?.filter(t => 
    !selectedTeams.includes(t.team_num) && 
    t.team_num.toString().includes(searchTerm)
  ).slice(0, 5); 

  // --- FILAS A COMPARAR (SIN RANK) ---
  const rows = [
    { label: 'Matches', getValue: (d: TeamOverview) => d.matches_played },
    { label: 'Puntos Totales', getValue: (d: TeamOverview) => d.overall.avg_total_pts.toFixed(1), highlight: true },
    { label: 'Auto Avg', getValue: (d: TeamOverview) => d.auto.avg_total_pts.toFixed(1) },
    { label: 'Teleop Fuel', getValue: (d: TeamOverview) => d.teleop.avg_fuel_pts.toFixed(1) },
    { label: 'Teleop Pts', getValue: (d: TeamOverview) => d.teleop.avg_total_pts.toFixed(1) },
    { label: 'Auto Success', getValue: (d: TeamOverview) => `${(d.auto.success_rate * 100).toFixed(0)}%` },
    { label: 'Hang Success', getValue: (d: TeamOverview) => `${(d.teleop.hang_success_rate * 100).toFixed(0)}%` },
    { label: 'Chasis', getValue: (d: TeamOverview) => d.advanced?.latest?.chasis || '-' },
  ];

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500">
      
      {/* HEADER Y BUSCADOR */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <BarChart3 className="text-indigo-500" /> Comparativa
          </h1>
          <p className="text-slate-400">Analiza fortalezas y debilidades lado a lado</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <Search className="ml-3 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Agregar equipo..." 
              className="w-full bg-transparent text-white px-3 py-2 outline-none placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
              {searchResults?.map(team => (
                <button
                  key={team.team_num}
                  onClick={() => handleAddTeam(team.team_num)}
                  className="w-full text-left px-4 py-3 hover:bg-indigo-600/20 hover:text-indigo-300 text-slate-300 flex justify-between items-center transition-colors"
                >
                  <span className="font-bold">{team.team_num}</span>
                  <Plus size={16} />
                </button>
              ))}
              {searchResults?.length === 0 && (
                <div className="p-3 text-slate-500 text-sm text-center">No encontrado</div>
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
                  Métrica
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
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors border-b border-slate-800/50 last:border-0">
                  <td className="p-4 text-slate-400 font-medium text-sm sticky left-0 bg-slate-950 z-10 border-r border-slate-900/50">
                    {row.label}
                  </td>

                  {selectedTeams.map(teamNum => {
                    const data = teamData[teamNum];
                    return (
                      <td key={`${teamNum}-${idx}`} className="p-4 text-center">
                        {data ? (
                          <span className={`text-lg font-mono ${row.highlight ? 'text-indigo-400 font-bold' : 'text-slate-200'}`}>
                            {row.getValue(data)}
                          </span>
                        ) : (
                          <div className="h-4 w-12 bg-slate-800 rounded animate-pulse mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl m-4 bg-slate-900/20">
          <div className="bg-slate-800 p-6 rounded-full mb-4">
            <BarChart3 size={48} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-300 mb-2">Comienza a Comparar</h3>
          <p className="max-w-md text-center mb-8">
            Busca y agrega equipos usando la barra superior.
          </p>
        </div>
      )}
    </div>
  );
};