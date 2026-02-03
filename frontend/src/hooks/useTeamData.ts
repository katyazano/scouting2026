import { useQuery } from '@tanstack/react-query';
import { getTeamOverview } from '../api/client';

export const useTeamData = (teamId: string) => {
  
  const overviewQuery = useQuery({
    queryKey: ['team', teamId, 'overview'],
    queryFn: () => getTeamOverview(Number(teamId)),
    enabled: !!teamId,
  });

  return {
    metrics: overviewQuery.data,
    // AQUÍ ESTÁ LA CLAVE: 
    // Usamos 'overviewQuery.data.trend' que viene directo de tu backend Python nuevo.
    // Si no existe, devolvemos array vacío para que no rompa.
    trendData: overviewQuery.data?.trend || [],
    
    isLoading: overviewQuery.isLoading,
    isError: overviewQuery.isError,
  };
};