import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Extract token or error from URL query parameters
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (token) {
      // Successfully authenticated via OAuth2
      login(token);
      navigate('/explore', { replace: true });
    } else if (errorParam) {
      // Failed to authenticate
      setError(decodeURIComponent(errorParam));
    } else {
      // Invalid URL or missing token
      setError('An unknown error occurred during authentication.');
    }
  }, [location, login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border text-center">
            <h2 className="text-2xl font-bold text-error mb-4">Authentication Failed</h2>
            <p className="text-text-secondary mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-secondary shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while parsing token and redirecting
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Activity size={48} className="text-primary animate-pulse mb-4" />
      <h2 className="text-xl font-medium text-text">Authenticating...</h2>
      <p className="text-text-secondary mt-2">Please wait while we log you in.</p>
    </div>
  );
}
