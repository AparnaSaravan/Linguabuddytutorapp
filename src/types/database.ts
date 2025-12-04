export interface Database {
  public: {
    Tables: {
      languages: {
        Row: {
          id: string;
          name: string;
          code: string;
          flag_emoji: string;
          difficulty_level: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          flag_emoji: string;
          difficulty_level?: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          flag_emoji?: string;
          difficulty_level?: string;
          description?: string;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          display_name: string;
          native_language: string;
          learning_languages: string[];
          total_conversations: number;
          total_messages: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          native_language?: string;
          learning_languages?: string[];
          total_conversations?: number;
          total_messages?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          native_language?: string;
          learning_languages?: string[];
          total_conversations?: number;
          total_messages?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          language_code: string;
          title: string;
          difficulty: string;
          message_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          language_code: string;
          title: string;
          difficulty?: string;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          language_code?: string;
          title?: string;
          difficulty?: string;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          translation: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          translation?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          translation?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
