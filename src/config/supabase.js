import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema for our application
export const DATABASE_SCHEMA = {
  // Users table (handled by Supabase Auth)
  profiles: {
    id: 'UUID PRIMARY KEY REFERENCES auth.users(id)',
    email: 'TEXT NOT NULL',
    full_name: 'TEXT',
    avatar_url: 'TEXT',
    role: 'TEXT DEFAULT "student"', // student, parent, teacher
    grade_level: 'TEXT',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()'
  },
  
  // Videos table
  videos: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    user_id: 'UUID REFERENCES profiles(id) ON DELETE CASCADE',
    title: 'TEXT NOT NULL',
    description: 'TEXT',
    question: 'TEXT NOT NULL',
    video_url: 'TEXT NOT NULL',
    thumbnail_url: 'TEXT',
    duration: 'INTEGER', // in seconds
    language: 'TEXT DEFAULT "zh"',
    math_topics: 'TEXT[]',
    difficulty_level: 'TEXT',
    solution_data: 'JSONB', // Store the AI solution
    processing_status: 'TEXT DEFAULT "completed"', // pending, processing, completed, failed
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()'
  },
  
  // User sessions and preferences
  user_preferences: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    user_id: 'UUID REFERENCES profiles(id) ON DELETE CASCADE',
    preferred_language: 'TEXT DEFAULT "zh"',
    difficulty_preference: 'TEXT',
    favorite_topics: 'TEXT[]',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()'
  }
}

// SQL scripts for database setup
export const CREATE_TABLES_SQL = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student',
  grade_level TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  question TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  language TEXT DEFAULT 'zh',
  math_topics TEXT[],
  difficulty_level TEXT,
  solution_data JSONB,
  processing_status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_language TEXT DEFAULT 'zh',
  difficulty_preference TEXT,
  favorite_topics TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Videos policies
CREATE POLICY "Users can view their own videos" 
  ON videos FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos" 
  ON videos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" 
  ON videos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" 
  ON videos FOR DELETE 
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" 
  ON user_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
  ON user_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON user_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS videos_user_id_idx ON videos(user_id);
CREATE INDEX IF NOT EXISTS videos_created_at_idx ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
`;