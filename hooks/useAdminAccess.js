import { useState, useEffect } from 'react';
/**
 * Custom hook to check admin access from localStorage
 * Handles SSR/hydration properly by only checking localStorage on client side
 * 
 * @returns {Object} { isAdmin: boolean, isLoading: boolean }
 */
export function useAdminAccess() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run on client side after hydration
    try {
      const adminToken = localStorage.getItem('isAdmin');
      console.log('Admin token from localStorage:', adminToken ? 'JWT token found' : 'No token');
      
      // If there's a JWT token, decode it to check if it's valid
      if (adminToken && adminToken.length > 0) {
        try {
          // Basic JWT validation - check if it has proper structure
          const tokenParts = adminToken.split('.');
          if (tokenParts.length === 3) {
            // Decode the payload (middle part)
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('JWT payload:', payload);
            
            // Check if token is not expired
            const currentTime = Math.floor(Date.now() / 1000);
            const isTokenValid = payload.exp && payload.exp > currentTime;
            
            console.log('Token valid:', isTokenValid);
            setIsAdmin(isTokenValid);
          } else {
            console.log('Invalid JWT structure');
            setIsAdmin(false);
          }
        } catch (jwtError) {
          console.log('Error decoding JWT:', jwtError);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      // Handle cases where localStorage is not available
      console.warn('localStorage not available:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isAdmin, isLoading };
}