import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { passhareApi } from '../services/api';
import { Users, Copy, Check, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Navigation from '../components/Navigation';

const Passhare = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      const session = await passhareApi.createSession();
      setSessionCode(session.code);
      setSessionId(session.id);
      toast.success('Session created! Share the code with others.');
    } catch (error) {
      console.error('Create session error:', error);
      const errorMessage = error.message || 'Failed to create session';
      toast.error(errorMessage);
      // If it's a 404, suggest restarting the backend
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        toast.error('Backend endpoint not found. Please ensure the backend server is running and restarted.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = async () => {
    if (!joinCode || joinCode.length !== 8) {
      toast.error('Please enter a valid 8-character code');
      return;
    }

    setIsJoining(true);
    try {
      const session = await passhareApi.joinSession(joinCode.toUpperCase());
      setSessionId(session.id);
      navigate(`/passhare/session/${session.id}`);
      toast.success('Joined session successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to join session');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCodeCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleStartSession = () => {
    if (sessionId) {
      navigate(`/passhare/session/${sessionId}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 fade-in-up">
            <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Passhare
            </h1>
            <p className={`${isDark ? 'text-white/80' : 'text-gray-600'}`}>
              Create or join a session to share files with others in real-time
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Session Card */}
            <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-8 rounded-xl fade-in-up`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-12 h-12 ${isDark ? 'bg-gradient-to-br from-blue-400/20 to-blue-600/20' : 'bg-gradient-to-br from-blue-100 to-blue-200'} rounded-xl flex items-center justify-center`}>
                  <Users className={`w-6 h-6 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Create Session
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                    Start a new sharing session
                  </p>
                </div>
              </div>

              {!sessionCode ? (
                <button
                  onClick={handleCreateSession}
                  disabled={isCreating}
                  className={`w-full py-4 rounded-xl font-semibold transition-all hover-lift ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                  } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isCreating ? 'Creating...' : 'Create Session'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                      Share this code:
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className={`flex-1 ${isDark ? 'bg-white/10 border border-white/20' : 'bg-gray-50 border border-gray-300'} rounded-lg px-4 py-3`}>
                        <p className={`text-2xl font-mono font-bold text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {sessionCode}
                        </p>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className={`p-3 rounded-lg transition-all hover-lift ${
                          isDark
                            ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                            : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {codeCopied ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleStartSession}
                    className={`w-full py-3 rounded-xl font-semibold transition-all hover-lift flex items-center justify-center space-x-2 ${
                      isDark
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                    }`}
                  >
                    <span>Start Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Join Session Card */}
            <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-8 rounded-xl fade-in-up`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-12 h-12 ${isDark ? 'bg-gradient-to-br from-green-400/20 to-green-600/20' : 'bg-gradient-to-br from-green-100 to-green-200'} rounded-xl flex items-center justify-center`}>
                  <ArrowRight className={`w-6 h-6 ${isDark ? 'text-green-300' : 'text-green-600'}`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Join Session
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                    Enter a session code
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                    Enter Session Code:
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 8))}
                    placeholder="ABCD1234"
                    maxLength={8}
                    className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-blue-500/50 focus:border-blue-500/50'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                </div>
                <button
                  onClick={handleJoinSession}
                  disabled={isJoining || !joinCode}
                  className={`w-full py-3 rounded-xl font-semibold transition-all hover-lift flex items-center justify-center space-x-2 ${
                    isDark
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  } ${isJoining || !joinCode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isJoining ? 'Joining...' : (
                    <>
                      <span>Join Session</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Passhare;

