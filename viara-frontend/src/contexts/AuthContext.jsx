import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * WHY: Check login status on app load
   * Runs once when app starts
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * WHY: Check if user is logged in
   * Reads from localStorage and updates state
   */
  const checkAuth = () => {
    try {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        
        setToken(savedToken);
        setUser(parsedUser);
        setIsLoggedIn(true);
        setIsAdmin(parsedUser.is_staff === true || parsedUser.is_superuser === true);
        
        console.log('Auth restored:', parsedUser.username);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      logout(); // Clear corrupted data
    }
  };

  /**
   * WHY: Login user
   * Called from Login component
   * Updates both localStorage AND context state
   */
  const login = (newToken, newUser) => {
    // Save to localStorage
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Update context state (triggers re-render)
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
    setIsAdmin(newUser.is_staff === true || newUser.is_superuser === true);

    console.log('User logged in:', newUser.username);
  };

  /**
   * WHY: Logout user
   * Clears both localStorage AND context state
   */
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Clear context state (triggers re-render)
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);

    console.log('User logged out');
  };

  // Value provided to all consuming components
  const value = {
    user,
    token,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;