import axios from 'axios';

// 1. Creamos la instancia de Axios
export const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // Tu Backend Flask
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Definimos la interfaz básica
export interface TeamSummary {
  team_num: number;
  nickname?: string;
}

// 3. Funciones exportadas
export const getTeamsList = async () => {
  const response = await apiClient.get<TeamSummary[]>('/api/teams');
  return response.data;
};

// Esta función devuelve los datos DIRECTAMENTE (response.data)
export const getTeamOverview = async (teamNum: number) => {
  const response = await apiClient.get(`/api/team/${teamNum}/overview`);
  return response.data;
};

export const getEventMetric = async (metricKey: string) => {
  const response = await apiClient.get(`/api/event/metrics/${metricKey}`);
  return response.data;
};

export const getTeamTrend = async (teamNum: string) => {
    const response = await apiClient.get(`/api/team/${teamNum}/trend`);
    return response.data;
};