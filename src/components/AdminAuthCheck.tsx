
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

const AdminAuthCheck: React.FC<AdminAuthCheckProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const adminSession = localStorage.getItem('adminSession');
      
      if (adminSession) {
        try {
          const session = JSON.parse(adminSession);
          // Check if session is valid (could add expiry check here)
          if (session.email && session.id) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('adminSession');
            navigate('/admin/login');
          }
        } catch (error) {
          localStorage.removeItem('adminSession');
          navigate('/admin/login');
        }
      } else {
        navigate('/admin/login');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AdminAuthCheck;
