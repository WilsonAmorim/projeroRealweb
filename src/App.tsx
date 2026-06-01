import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Trocado para BrowserRouter
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Faturamento from './pages/Faturamento';
import Clients from './pages/Clients';
import Motors from './pages/Motors';
// import OpenOS from './pages/OpenOS';
import CreateOSForm from './pages/CreateOSForm';
import UpdateOSForm from './pages/UpdateOSForm';
import OSServiceTracking from './pages/OSServiceTracking';
import OSOrcamento from './pages/OSOrcamento';
import OSLaudoMecanicoPDF from './pages/OSLaudoMecanicoPDF';
import OSLaudoEletricoPDF from './pages/OSLaudoEletricoPDF';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter> {/* Trocado aqui */}
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/motores"
            element={
              <ProtectedRoute>
                <Motors />
              </ProtectedRoute>
            }
          />

          <Route
            path="/faturamento"
            element={
              <ProtectedRoute requiredRole={1}>
                <Faturamento />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />

          <Route
            path="/os/abrir/:idMotor"
            element={
              <ProtectedRoute>
                <CreateOSForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/os/:id"
            element={
              <ProtectedRoute>
                <UpdateOSForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/os/:id/acompanhamento"
            element={
              <ProtectedRoute>
                <OSServiceTracking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/os/:id/orcamento"
            element={
              <ProtectedRoute>
                <OSOrcamento />
              </ProtectedRoute>
            }
          />

          <Route
            path="/os/:id/laudo-mecanico"
            element={
              <ProtectedRoute>
                <OSLaudoMecanicoPDF />
              </ProtectedRoute>
            }
          />

          <Route
            path="/os/:id/laudo-eletrico"
            element={
              <ProtectedRoute>
                <OSLaudoEletricoPDF />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter> {/* Trocado aqui */}
    </AuthProvider>
  );
}

export default App;