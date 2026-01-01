import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../App';

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          navigate('/login');
          return;
        }

        const response = await api.post('/auth/session', null, {
          headers: { 'X-Session-ID': sessionId }
        });

        const user = response.data;
        
        const dashboardMap = {
          admin: '/dashboard/admin',
          agent: '/dashboard/agent',
          owner: '/dashboard/owner',
          tenant: '/dashboard/tenant'
        };

        navigate(dashboardMap[user.role] || '/', { 
          replace: true,
          state: { user }
        });
      } catch (error) {
        console.error('Session creation failed:', error);
        navigate('/login');
      }
    };

    processSession();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Setting up your account...</p>
      </div>
    </div>
  );
}

export default AuthCallback;