import { createContext, useContext, useReducer, useEffect } from 'react';
import { UserRole } from '../types';
import { authApi } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: JSON.parse(userData) });
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { token, user } = await authApi.login(email, password);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message || 'Login failed' });
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { token, user } = await authApi.register(name, email, password);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message || 'Register failed' });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const updateProfilePicture = async (file) => {
    try {
      let imageUrl = null;
      if (file) {
        imageUrl = URL.createObjectURL(file);
      }
      const updatedUser = {
        ...state.user,
        avatar: imageUrl,
        profilePictureFile: file
      };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER', payload: { avatar: imageUrl, profilePictureFile: file } });
      return { success: true, imageUrl };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    updateProfilePicture
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
