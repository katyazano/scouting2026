import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Home } from './features/home/Home';
import { TeamPage } from './features/team/TeamPage'; // <--- Importar
import { TeamsList } from './features/team/TeamsList';
import { ComparePage } from './features/compare/ComparePage';
import { TrendsPage } from './features/trends/TrendsPage';
import { AnalysisPage } from './features/analysis/AnalysisPage';

// Configuración del cliente de datos (React Query)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Los datos duran 5 minutos frescos
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* El Layout envuelve todas las rutas */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            
            {/* Nueva ruta para la lista de equipos */}
            <Route path="teams" element={<TeamsList />} />

            {/* Nueva ruta para la página de comparación */}
            <Route path="compare" element={<ComparePage />} />
            
            {/* Nueva ruta para la página de tendencias */}
            <Route path="trends" element={<TrendsPage />} />

            {/* Nueva ruta para la página de análisis */}
            <Route path="analysis" element={<AnalysisPage />} />
            
            {/* Redirigir cualquier ruta desconocida al inicio */}
            <Route path="*" element={<Navigate to="/" replace />} />

            <Route path="teams/:teamId" element={<TeamPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;