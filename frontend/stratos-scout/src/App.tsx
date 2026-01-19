import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Home } from './features/home/Home';
import { TeamPage } from './features/team/TeamPage'; // <--- Importar

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
            
            {/* Aquí agregaremos las otras rutas pronto */}
            <Route path="teams" element={<div className="text-white">Buscador de Equipos (Pronto)</div>} />
            <Route path="compare" element={<div className="text-white">Comparativa (Pronto)</div>} />
            
            {/* Redirigir cualquier ruta desconocida al inicio */}
            <Route path="*" element={<Navigate to="/" replace />} />

            <Route path="teams/:teamId" element={<TeamPage />} />
            {/* Ruta temporal para ver la lista (por ahora redirige a un equipo default para probar) */}
            <Route path="teams" element={<Navigate to="/teams/4635" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;