import axios from 'axios';

// CAMBIA ESTO: Pon la IP de tu compu donde corre Flask
// Si estás probando en la misma compu, usa localhost:5000
// En el evento, será algo como 'http://192.168.1.50:5000'
const API_URL = 'http://localhost:8000'; 

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 segundos de espera máximo (redes inestables)
});

// Definimos la función para obtener el overview
export const getTeamOverview = async (teamNumber: string) => {
  const response = await apiClient.get(`/api/team/${teamNumber}/overview`);
  return response.data;
};

// Definimos la función para obtener las tendencias (para la gráfica)
export const getTeamTrend = async (teamNumber: string) => {
  const response = await apiClient.get(`/api/team/${teamNumber}/trend`);
  return response.data;
};