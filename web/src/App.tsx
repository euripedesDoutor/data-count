import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import CollectorLayout from './components/CollectorLayout';
import Dashboard from './pages/Dashboard';
import Surveys from './pages/Surveys';
import SurveyDetails from './pages/SurveyDetails';
import { Heatmap } from './pages/Heatmap';
import Clients from './pages/Clients';
import Collectors from './pages/Collectors';
import Reports from './pages/Reports';
import ChangePassword from './pages/ChangePassword';
import Login from './pages/Login';
import CollectorDashboard from './pages/CollectorDashboard';
import SurveyExecution from './pages/SurveyExecution';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

const AdminRoute = () => {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/" />;
};

const ManagementRoute = () => {
  const { user } = useAuth();
  // If user is a collector (INTERVIEWER), redirect to their dashboard
  if (user?.role === 'INTERVIEWER') {
    return <Navigate to="/collector/dashboard" />;
  }
  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/datacount">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Management Routes - Protected from Collectors */}
            <Route element={<ManagementRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="surveys" element={<Surveys />} />
                <Route path="surveys/:id" element={<SurveyDetails />} />
                <Route path="map" element={<Heatmap />} />
                <Route path="heatmap" element={<Heatmap />} />
                <Route path="collectors" element={<Collectors />} />
                <Route path="reports" element={<Reports />} />
                <Route path="reports" element={<Reports />} />

                <Route element={<AdminRoute />}>
                  <Route path="clients" element={<Clients />} />
                </Route>
              </Route>
            </Route>

            {/* Collector Layout Routes */}
            <Route path="/collector" element={<CollectorLayout />}>
              <Route path="dashboard" element={<CollectorDashboard />} />
            </Route>
            {/* Survey Execution is standalone or under collector layout? 
                Let's put it under CollectorLayout to keep the header. 
                But SurveyExecution has its own header. 
                If we use CollectorLayout, we get double header.
                SurveyExecution seems designed to be standalone.
                Let's keep SurveyExecution standalone but protected.
            */}
            <Route path="/surveys/:id/run" element={<SurveyExecution />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
