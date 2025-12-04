import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { MessageSquare, Clock, Award, LogOut, History } from 'lucide-react';

interface Language {
  id: string;
  name: string;
  code: string;
  flag_emoji: string;
  difficulty_level: string;
  description: string;
}

interface Conversation {
  id: string;
  language_code: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  display_name: string;
  total_conversations: number;
  total_messages: number;
}

interface DashboardProps {
  onSelectLanguage: (language: Language) => void;
  onSelectConversation: (conversationId: string) => void;
}

export function Dashboard({ onSelectLanguage, onSelectConversation }: DashboardProps) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchConversations();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const fetchConversations = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (data) {
      setConversations(data);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                LinguaBuddy
              </h1>
              <p className="text-xs text-gray-600">AI Language Tutor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <History className="w-5 h-5" />
              <span className="font-medium">History</span>
            </button>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{profile?.display_name || 'User'}</p>
              <p className="text-xs text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {showHistory ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Conversations</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Back to Languages
              </button>
            </div>
            <div className="grid gap-4">
              {conversations.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No conversations yet. Start practicing!</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{conv.title}</h3>
                        <p className="text-sm text-gray-600">{conv.message_count} messages</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatDate(conv.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Conversations</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{profile?.total_conversations || 0}</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Messages</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{profile?.total_messages || 0}</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Streak</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>

            <LanguageSelector onSelectLanguage={onSelectLanguage} />
          </>
        )}
      </div>
    </div>
  );
}
