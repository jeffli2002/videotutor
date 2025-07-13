#!/bin/bash

# Database Setup Script for MathTutor AI
# This script runs the SQL setup for Supabase

echo "🗄️  Setting up MathTutor AI Database..."

# Check if we have the necessary environment variables
if [[ -z "${VITE_SUPABASE_URL}" || -z "${VITE_SUPABASE_ANON_KEY}" ]]; then
    echo "❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required"
    echo "Please check your .env file"
    exit 1
fi

echo "📋 Database URL: ${VITE_SUPABASE_URL}"
echo "🔑 Using API Key: ${VITE_SUPABASE_ANON_KEY:0:10}..."

# Create a temporary SQL file with the setup script
cat > /tmp/setup_database.sql << 'EOF'
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
EOF

echo "📝 Created SQL setup script"
echo "⚠️  To complete the setup, please:"
echo "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Go to the SQL Editor"
echo "4. Copy and paste the contents of /tmp/setup_database.sql"
echo "5. Run the SQL script"
echo ""
echo "💡 Alternatively, you can run the setup through the Supabase CLI:"
echo "   supabase db reset --linked"
echo ""
echo "🎯 After setup is complete, you can:"
echo "• Register new users through the authentication form"
echo "• Generate and save AI math videos to the database"
echo "• View user videos in the 'My Videos' section"
echo "• Manage user profiles and preferences"
echo ""
echo "✅ Database setup script ready!"