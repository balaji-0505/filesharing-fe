import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Bell, Settings, LogOut, User, Moon, Sun, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationCenter from './NotificationCenter';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'blue' },
    { name: 'Passhare', href: '/passhare', icon: Users, color: 'orange' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'green' },
    { name: 'Profile', href: '/profile', icon: User, color: 'purple' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getColorClasses = (color, isActive) => {
    const colorMap = {
      blue: {
        active: isDark ? 'bg-blue-500/30 text-blue-300 border-blue-400/50' : 'bg-blue-100 text-blue-700 border-blue-200',
        inactive: isDark ? 'text-blue-200/70 hover:bg-blue-500/20 hover:text-blue-300' : 'text-blue-600/70 hover:bg-blue-50 hover:text-blue-700'
      },
      green: {
        active: isDark ? 'bg-green-500/30 text-green-300 border-green-400/50' : 'bg-green-100 text-green-700 border-green-200',
        inactive: isDark ? 'text-green-200/70 hover:bg-green-500/20 hover:text-green-300' : 'text-green-600/70 hover:bg-green-50 hover:text-green-700'
      },
      purple: {
        active: isDark ? 'bg-purple-500/30 text-purple-300 border-purple-400/50' : 'bg-purple-100 text-purple-700 border-purple-200',
        inactive: isDark ? 'text-purple-200/70 hover:bg-purple-500/20 hover:text-purple-300' : 'text-purple-600/70 hover:bg-purple-50 hover:text-purple-700'
      },
      orange: {
        active: isDark ? 'bg-orange-500/30 text-orange-300 border-orange-400/50' : 'bg-orange-100 text-orange-700 border-orange-200',
        inactive: isDark ? 'text-orange-200/70 hover:bg-orange-500/20 hover:text-orange-300' : 'text-orange-600/70 hover:bg-orange-50 hover:text-orange-700'
      }
    };
    return colorMap[color][isActive ? 'active' : 'inactive'];
  };

  return (
    <nav className={`${isDark ? 'glass-card border-b border-white/20' : 'bg-white/80 backdrop-blur-md border-b border-gray-200'} sticky top-0 z-50`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center group hover-lift">
              <div className={`w-10 h-10 ${isDark ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-blue-500 to-blue-700'} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200`}>
                <span className="text-white font-bold text-sm">FS</span>
              </div>
              <span className={`ml-3 text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>FileShare</span>
            </Link>

            <div className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 hover-lift ${getColorClasses(item.color, active)}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 hover-lift ${
                isDark 
                  ? 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/20' 
                  : 'text-amber-600 hover:text-amber-700 hover:bg-amber-100'
              }`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <NotificationCenter />

            {/* User menu */}
            <div className={`flex items-center space-x-3 ${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} px-3 py-2 rounded-lg`}>
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=3b82f6&color=fff`}
                alt={user.name}
                className={`w-8 h-8 rounded-full object-cover ring-2 ${isDark ? 'ring-white/20' : 'ring-gray-200'}`}
              />
              <div className="hidden md:block">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{user.email}</p>
              </div>
              <button
                onClick={logout}
                className={`p-2 rounded-lg transition-all duration-200 hover-lift ${
                  isDark 
                    ? 'text-red-300 hover:text-red-200 hover:bg-red-500/20' 
                    : 'text-red-600 hover:text-red-700 hover:bg-red-100'
                }`}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
