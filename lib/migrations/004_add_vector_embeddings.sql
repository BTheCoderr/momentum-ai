-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for storing user behavior embeddings
CREATE TABLE IF NOT EXISTS user_behavior_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    behavior_type TEXT NOT NULL, -- 'goal_update', 'check_in', 'chat_message', 'pattern'
    content TEXT NOT NULL,
    embedding VECTOR(384), -- Using sentence-transformers/all-MiniLM-L6-v2 dimensions
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for storing coaching knowledge base
CREATE TABLE IF NOT EXISTS coaching_knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL, -- 'habit_formation', 'motivation', 'productivity', 'psychology'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(384),
    tags TEXT[],
    effectiveness_score REAL DEFAULT 0.0,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for pattern recognition results
CREATE TABLE IF NOT EXISTS user_pattern_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    pattern_type TEXT NOT NULL, -- 'peak_performance', 'struggle_points', 'motivation_triggers'
    insight_title TEXT NOT NULL,
    insight_description TEXT NOT NULL,
    confidence_score REAL NOT NULL,
    supporting_data JSONB,
    embedding VECTOR(384),
    is_actionable BOOLEAN DEFAULT FALSE,
    suggested_actions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create table for predictive models results
CREATE TABLE IF NOT EXISTS user_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    prediction_type TEXT NOT NULL, -- 'goal_success', 'habit_streak', 'motivation_dip'
    prediction_value REAL NOT NULL,
    confidence_score REAL NOT NULL,
    factors JSONB, -- Contributing factors
    recommended_interventions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE
);

-- Create table for AI conversations with embeddings
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    coach_id TEXT NOT NULL,
    user_context JSONB,
    message_embedding VECTOR(384),
    response_embedding VECTOR(384),
    sentiment_score REAL,
    effectiveness_rating INTEGER, -- 1-5 rating from user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for vector similarity search
CREATE INDEX IF NOT EXISTS idx_behavior_embeddings_vector 
ON user_behavior_embeddings USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_coaching_knowledge_vector 
ON coaching_knowledge_base USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_pattern_insights_vector 
ON user_pattern_insights USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_conversation_message_vector 
ON ai_conversations USING ivfflat (message_embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_conversation_response_vector 
ON ai_conversations USING ivfflat (response_embedding vector_cosine_ops);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_behavior_embeddings_user_type 
ON user_behavior_embeddings (user_id, behavior_type);

CREATE INDEX IF NOT EXISTS idx_coaching_knowledge_category 
ON coaching_knowledge_base (category);

CREATE INDEX IF NOT EXISTS idx_pattern_insights_user_type 
ON user_pattern_insights (user_id, pattern_type);

CREATE INDEX IF NOT EXISTS idx_predictions_user_type 
ON user_predictions (user_id, prediction_type);

CREATE INDEX IF NOT EXISTS idx_conversations_user_coach 
ON ai_conversations (user_id, coach_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_behavior_embeddings_updated_at 
    BEFORE UPDATE ON user_behavior_embeddings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coaching_knowledge_updated_at 
    BEFORE UPDATE ON coaching_knowledge_base 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pattern_insights_updated_at 
    BEFORE UPDATE ON user_pattern_insights 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_behavior_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pattern_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own behavior embeddings" 
ON user_behavior_embeddings FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own pattern insights" 
ON user_pattern_insights FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own predictions" 
ON user_predictions FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own conversations" 
ON ai_conversations FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- Create function for semantic search
CREATE OR REPLACE FUNCTION semantic_search_coaching_knowledge(
    query_embedding VECTOR(384),
    match_threshold REAL DEFAULT 0.78,
    match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    category TEXT,
    title TEXT,
    content TEXT,
    tags TEXT[],
    similarity REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ck.id,
        ck.category,
        ck.title,
        ck.content,
        ck.tags,
        1 - (ck.embedding <=> query_embedding) AS similarity
    FROM coaching_knowledge_base ck
    WHERE 1 - (ck.embedding <=> query_embedding) > match_threshold
    ORDER BY ck.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Create function for finding similar user behaviors
CREATE OR REPLACE FUNCTION find_similar_behaviors(
    user_id UUID,
    query_embedding VECTOR(384),
    match_threshold REAL DEFAULT 0.75,
    match_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    behavior_type TEXT,
    content TEXT,
    metadata JSONB,
    similarity REAL,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ube.behavior_type,
        ube.content,
        ube.metadata,
        1 - (ube.embedding <=> query_embedding) AS similarity,
        ube.created_at
    FROM user_behavior_embeddings ube
    WHERE ube.user_id = find_similar_behaviors.user_id
    AND 1 - (ube.embedding <=> query_embedding) > match_threshold
    ORDER BY ube.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Insert sample coaching knowledge
INSERT INTO coaching_knowledge_base (category, title, content, tags) VALUES
('habit_formation', 'The 2-Minute Rule', 'Start with habits that take less than 2 minutes to complete. This makes it easier to build consistency and momentum.', ARRAY['habits', 'consistency', 'momentum']),
('motivation', 'Peak Performance Times', 'Most people have natural energy peaks during specific times of day. Track your energy levels to identify your optimal performance windows.', ARRAY['energy', 'performance', 'timing']),
('productivity', 'The 80/20 Rule', 'Focus on the 20% of activities that produce 80% of your results. Identify your high-impact tasks and prioritize them.', ARRAY['productivity', 'focus', 'prioritization']),
('psychology', 'Growth Mindset', 'View challenges as opportunities to grow rather than threats to your ability. This mindset shift dramatically improves resilience.', ARRAY['mindset', 'resilience', 'growth']),
('habit_formation', 'Habit Stacking', 'Link new habits to existing ones. After I [existing habit], I will [new habit]. This creates a clear trigger for the new behavior.', ARRAY['habits', 'triggers', 'stacking']),
('motivation', 'Identity-Based Habits', 'Instead of focusing on what you want to achieve, focus on who you want to become. Ask "What would a [desired identity] person do?"', ARRAY['identity', 'motivation', 'mindset']),
('productivity', 'Time Blocking', 'Assign specific time blocks to different activities. This prevents multitasking and ensures focused work on priorities.', ARRAY['time-management', 'focus', 'planning']),
('psychology', 'The Compound Effect', 'Small, consistent actions compound over time to create significant results. Focus on the process, not just the outcome.', ARRAY['consistency', 'compound', 'process']);

-- Success message
SELECT 'Vector database setup completed successfully! 🎯' AS message; 