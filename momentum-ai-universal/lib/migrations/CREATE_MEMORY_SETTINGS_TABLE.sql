-- CREATE MEMORY SETTINGS TABLE - For the MemorySettingsScreen

-- Create user_memory_settings table
CREATE TABLE IF NOT EXISTS user_memory_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  context_retention INTEGER DEFAULT 30,
  personalized_learning BOOLEAN DEFAULT true,
  behavior_analysis BOOLEAN DEFAULT true,
  pattern_recognition BOOLEAN DEFAULT true,
  emotional_awareness BOOLEAN DEFAULT true,
  goal_alignment BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make user_id unique
ALTER TABLE user_memory_settings ADD CONSTRAINT user_memory_settings_user_id_unique UNIQUE (user_id);

-- Verify table was created
SELECT 'user_memory_settings table created successfully' as status; 