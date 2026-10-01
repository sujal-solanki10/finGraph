import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';
import StockResearch from './pages/StockResearch';
import StockDetail from './pages/StockDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/explore" element={<StockResearch />} />
            <Route path="/stocks/:symbol" element={<StockDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
