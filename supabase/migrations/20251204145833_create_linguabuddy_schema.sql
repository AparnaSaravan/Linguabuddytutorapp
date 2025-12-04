/*
  # LinguaBuddy Database Schema

  ## Overview
  Complete database schema for the LinguaBuddy language learning application with AI-powered conversation practice.

  ## New Tables

  ### 1. `languages`
  Stores supported languages for learning
  - `id` (uuid, primary key) - Unique language identifier
  - `name` (text) - Language name (e.g., "Hindi", "Spanish")
  - `code` (text) - ISO language code (e.g., "hi", "es")
  - `flag_emoji` (text) - Flag emoji for visual representation
  - `difficulty_level` (text) - Beginner, Intermediate, Advanced
  - `description` (text) - Brief description of the language
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `user_profiles`
  Extended user information beyond auth.users
  - `id` (uuid, primary key) - References auth.users(id)
  - `display_name` (text) - User's display name
  - `native_language` (text) - User's native language
  - `learning_languages` (jsonb) - Array of languages user is learning
  - `total_conversations` (integer) - Total conversation count
  - `total_messages` (integer) - Total messages sent
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `conversations`
  Stores conversation sessions between user and AI tutor
  - `id` (uuid, primary key) - Unique conversation identifier
  - `user_id` (uuid, foreign key) - References auth.users(id)
  - `language_code` (text) - Language being practiced
  - `title` (text) - Conversation title/topic
  - `difficulty` (text) - Conversation difficulty level
  - `message_count` (integer) - Number of messages in conversation
  - `created_at` (timestamptz) - Conversation start time
  - `updated_at` (timestamptz) - Last message timestamp

  ### 4. `messages`
  Individual messages within conversations
  - `id` (uuid, primary key) - Unique message identifier
  - `conversation_id` (uuid, foreign key) - References conversations(id)
  - `role` (text) - 'user' or 'assistant'
  - `content` (text) - Message content
  - `translation` (text) - English translation (for assistant messages)
  - `created_at` (timestamptz) - Message timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Languages table is publicly readable
  - Strict ownership checks on all operations

  ## Indexes
  - Indexes on foreign keys for performance
  - Index on language_code for quick lookups
*/

-- Create languages table
CREATE TABLE IF NOT EXISTS languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  flag_emoji text NOT NULL,
  difficulty_level text DEFAULT 'Beginner',
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  native_language text DEFAULT 'English',
  learning_languages jsonb DEFAULT '[]'::jsonb,
  total_conversations integer DEFAULT 0,
  total_messages integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  title text NOT NULL,
  difficulty text DEFAULT 'Beginner',
  message_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  translation text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_language ON conversations(language_code);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for languages (public read)
CREATE POLICY "Anyone can view languages"
  ON languages
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in own conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Insert initial language data
INSERT INTO languages (name, code, flag_emoji, difficulty_level, description) VALUES
  ('Spanish', 'es', '🇪🇸', 'Beginner', 'Learn Spanish with conversational practice and cultural insights'),
  ('French', 'fr', '🇫🇷', 'Beginner', 'Master French through interactive dialogue and pronunciation'),
  ('German', 'de', '🇩🇪', 'Intermediate', 'Practice German conversation with grammar explanations'),
  ('Hindi', 'hi', '🇮🇳', 'Beginner', 'Learn Hindi with regional dialects and cultural context'),
  ('Mandarin', 'zh', '🇨🇳', 'Advanced', 'Practice Mandarin Chinese with tone guidance'),
  ('Japanese', 'ja', '🇯🇵', 'Intermediate', 'Learn Japanese through conversation and cultural nuances'),
  ('Italian', 'it', '🇮🇹', 'Beginner', 'Practice Italian with native expressions and phrases'),
  ('Portuguese', 'pt', '🇵🇹', 'Beginner', 'Master Portuguese through real-world conversations')
ON CONFLICT (code) DO NOTHING;