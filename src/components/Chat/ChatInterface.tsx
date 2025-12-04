import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Send, Lightbulb, ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  translation?: string | null;
  tip?: string | null;
}

interface Language {
  id: string;
  name: string;
  code: string;
  flag_emoji: string;
  difficulty_level: string;
}

interface ChatInterfaceProps {
  language: Language;
  onBack: () => void;
}

export function ChatInterface({ language, onBack }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        language_code: language.code,
        title: `${language.name} Practice`,
        difficulty: language.difficulty_level,
      })
      .select()
      .single();

    if (!error && data) {
      setConversationId(data.id);

      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(language.name),
        translation: `Hello! I'm your ${language.name} tutor. Let's practice together!`,
      };
      setMessages([welcomeMessage]);
    }
  };

  const getWelcomeMessage = (languageName: string) => {
    const welcomes: Record<string, string> = {
      Spanish: '¡Hola! Soy tu tutor de español. ¡Vamos a practicar juntos!',
      French: 'Bonjour! Je suis votre tuteur de français. Pratiquons ensemble!',
      German: 'Hallo! Ich bin dein Deutsch-Tutor. Lass uns zusammen üben!',
      Hindi: 'नमस्ते! मैं आपका हिंदी शिक्षक हूं। चलिए साथ में अभ्यास करते हैं!',
      Mandarin: '你好！我是你的中文老师。让我们一起练习吧！',
      Japanese: 'こんにちは！私はあなたの日本語の先生です。一緒に練習しましょう！',
      Italian: 'Ciao! Sono il tuo tutor di italiano. Pratichiamo insieme!',
      Portuguese: 'Olá! Sou seu tutor de português. Vamos praticar juntos!',
    };
    return welcomes[languageName] || 'Hello! Let\'s practice together!';
  };

  const handleSend = async () => {
    if (!input.trim() || !conversationId || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: userMessage.content,
    });

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      const conversationHistory = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...conversationHistory, { role: 'user', content: userMessage.content }],
          languageCode: language.code,
          languageName: language.name,
          difficulty: language.difficulty_level,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const aiData = await response.json();

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiData.response,
        translation: aiData.translation,
        tip: aiData.tip,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantMessage.content,
        translation: assistantMessage.translation,
      });

      await supabase
        .from('conversations')
        .update({
          message_count: messages.length + 2,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          translation: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{language.flag_emoji}</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{language.name}</h1>
              <p className="text-sm text-gray-600">{language.difficulty_level} Level</p>
            </div>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-white border border-gray-200'
                } rounded-2xl px-6 py-4 shadow-sm`}
              >
                <p className={`text-lg ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`}>
                  {message.content}
                </p>
                {message.translation && (
                  <p className="mt-2 text-sm opacity-80 italic border-t border-gray-200 pt-2">
                    {message.translation}
                  </p>
                )}
                {message.tip && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">{message.tip}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm flex items-center gap-2">
                <Loader className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-gray-600">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Type in ${language.name}...`}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
