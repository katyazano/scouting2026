import axios from 'axios';

// 1. Configuración de la URL Base
// Intenta leer la variable de entorno, si no existe, usa localhost:8000
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log(`Conectando a backend en: ${BASE_URL}`);

// 2. Creamos la instancia de Axios
export const apiClient = axios.create({
  baseURL: BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Interfaces
export interface TeamSummary {
  team_num: number;
  nickname?: string;
}

// 4. Funciones de Llamada a la API

// Obtener lista de todos los equipos
export const getTeamsList = async () => {
  // Ruta Backend: @app.route('/api/teams')
  const response = await apiClient.get<TeamSummary[]>('/api/teams');
  return response.data;
};

// Obtener perfil completo de un equipo
export const getTeamOverview = async (teamNum: number | string) => {
  // Ruta Backend: @app.route('/api/team/<team_num>/overview')
  const response = await apiClient.get(`/api/team/${teamNum}/overview`);
  return response.data;
};

// Obtener datos para gráficas de tendencias (MatchTrendChart)
export const getTeamTrend = async (teamNum: number | string) => {
  // Ruta Backend: @app.route('/api/team/<team_num>/trend')
  const response = await apiClient.get(`/api/team/${teamNum}/trend`);
  return response.data;
};

// Obtener métricas globales del evento (Para AnalysisPage)
export const getEventMetric = async (metricKey: string) => {
  // Ruta Backend: @app.route('/api/event/metric/<metric_key>')
  // NOTA: Es "metric" en singular, coincidiendo con el backend python
  const response = await apiClient.get(`/api/event/metrics/${metricKey}`);
  return response.data;
};