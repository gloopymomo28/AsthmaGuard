import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import PatientDetail from './pages/PatientDetail';
import NewPatient from './pages/NewPatient';
import Patients from './pages/Patients';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patient/new" element={<NewPatient />} />
            <Route path="patient/:id" element={<PatientDetail />} />
            <Route path="patients" element={<Patients />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
