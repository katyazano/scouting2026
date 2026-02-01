import { useQuery } from '@tanstack/react-query';
import { getTeamOverview, getTeamTrend } from '../api/client';
import type { TeamOverview, MatchTrend } from '../types'; // <--- Tipos Nuevos

export const useTeamData = (teamNumber: string) => {
  const overview = useQuery({
    queryKey: ['team', teamNumber, 'overview'],
    queryFn: () => getTeamOverview(teamNumber),
    enabled: !!teamNumber,
  });

  const trends = useQuery({
    queryKey: ['team', teamNumber, 'trends'],
    queryFn: () => getTeamTrend(teamNumber),
    enabled: !!teamNumber,
  });

  return {
    metrics: overview.data as TeamOverview | undefined, // <--- Cast correcto
    trendData: trends.data as MatchTrend[] | undefined, // <--- Cast correcto
    isLoading: overview.isLoading || trends.isLoading,
    isError: overview.isError || trends.isError,
  };
};