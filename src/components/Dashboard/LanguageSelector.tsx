import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Languages, Sparkles, ArrowRight } from 'lucide-react';

interface Language {
  id: string;
  name: string;
  code: string;
  flag_emoji: string;
  difficulty_level: string;
  description: string;
}

interface LanguageSelectorProps {
  onSelectLanguage: (language: Language) => void;
}

export function LanguageSelector({ onSelectLanguage }: LanguageSelectorProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('name');

    if (!error && data) {
      setLanguages(data);
    }
    setLoading(false);
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4">
          <Languages className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Language</h2>
        <p className="text-xl text-gray-600">Start conversing with AI in your target language</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map((language) => (
          <div
            key={language.id}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => onSelectLanguage(language)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl">{language.flag_emoji}</div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(language.difficulty_level)}`}>
                {language.difficulty_level}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">{language.name}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{language.description}</p>

            <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
