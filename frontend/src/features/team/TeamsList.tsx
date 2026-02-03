import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Users, Loader2, WifiOff, ChevronRight, Hash } from 'lucide-react';
import { getTeamsList } from '../../api/client';

export const TeamsList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: teams, isLoading, isError } = useQuery({
    queryKey: ['teams-list'],
    queryFn: getTeamsList,
  });

  const filteredTeams = teams?.filter(team => 
    team.team_num.toString().includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <Loader2 className="animate-spin mr-2" /> Loading teams list...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-400">
        <WifiOff size={48} className="mb-4" />
        <h3 className="text-lg font-bold">Error loading teams</h3>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
      
      {/* HEADER Y BUSCADOR */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="text-indigo-500" /> Teams
          </h1>
          <p className="text-slate-400 mt-1">
            {filteredTeams?.length} Registered Teams
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search teams..." 
            className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LISTA VERTICAL LIMPIA */}
      <div className="flex flex-col gap-3">
        {filteredTeams && filteredTeams.length > 0 ? (
          filteredTeams.map((team) => (
            <Link 
              key={team.team_num} 
              to={`/teams/${team.team_num}`}
              className="group flex items-center justify-between bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 rounded-lg p-4 transition-all"
            >
              {/* Solo Número */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900 rounded-lg text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-900/20 transition-colors">
                    <Hash size={20} />
                </div>
                <span className="font-black text-3xl text-slate-200 group-hover:text-white tracking-tight">
                    {team.team_num}
                </span>
              </div>

              {/* Flecha */}
              <div className="flex items-center">
                <ChevronRight className="text-slate-600 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" size={24} />
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
            <p className="text-slate-500">No teams with this number found.</p>
          </div>
        )}
      </div>
    </div>
  );
};