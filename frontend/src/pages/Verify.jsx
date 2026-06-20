import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const { verifyMagicLink } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setError('Invalid verification link.');
      return;
    }

    const authenticate = async () => {
      const result = await verifyMagicLink(token, email);
      if (result.success) {
        navigate('/patients');
      } else {
        setError(result.message);
      }
    };

    authenticate();
  }, [searchParams, verifyMagicLink, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h3 className="text-xl font-semibold text-red-300">Authentication Failed</h3>
          <p className="text-red-200/80 text-sm">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <h3 className="text-xl font-medium text-slate-200">Verifying secure token...</h3>
        </div>
      )}
    </div>
  );
};

export default Verify;
