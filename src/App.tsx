import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ChatInterface } from './components/Chat/ChatInterface';

interface Language {
  id: string;
  name: string;
  code: string;
  flag_emoji: string;
  difficulty_level: string;
  description: string;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading LinguaBuddy...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authMode === 'login') {
      return <Login onToggleMode={() => setAuthMode('signup')} />;
    }
    return <Signup onToggleMode={() => setAuthMode('login')} />;
  }

  if (selectedLanguage) {
    return (
      <ChatInterface
        language={selectedLanguage}
        onBack={() => setSelectedLanguage(null)}
      />
    );
  }

  return (
    <Dashboard
      onSelectLanguage={(language) => setSelectedLanguage(language)}
      onSelectConversation={(conversationId) => {
        console.log('Open conversation:', conversationId);
      }}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
