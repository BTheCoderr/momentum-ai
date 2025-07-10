-- AI Backend Database Schema
-- This migration adds tables required for the AI backend service

-- Behavior Data Table - Store user behavior for pattern analysis
CREATE TABLE IF NOT EXISTS behavior_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Behavior Profiles Table - Store analyzed behavior patterns
CREATE TABLE IF NOT EXISTS behavior_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patterns JSONB NOT NULL,
    drift_probability DECIMAL(5,4) DEFAULT 0.0,
    risk_level VARCHAR(20) DEFAULT 'low',
    last_analysis TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- AI Insights Table - Store AI-generated insights
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0.0,
    actionable BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (TIMEZONE('utc'::text, NOW()) + INTERVAL '7 days')
);

-- Drift Predictions Table - Store drift predictions and interventions
CREATE TABLE IF NOT EXISTS drift_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    drift_probability DECIMAL(5,4) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    interventions JSONB NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0.0,
    timeframe INTEGER DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Future Plans Table - Store AI-generated future plans
CREATE TABLE IF NOT EXISTS future_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    goals JSONB NOT NULL,
    strategies JSONB NOT NULL,
    timeline JSONB NOT NULL,
    success_probability DECIMAL(3,2) DEFAULT 0.0,
    recommended_actions JSONB NOT NULL,
    timeframe INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- AI Context Cache Table - Cache user context for faster AI responses
CREATE TABLE IF NOT EXISTS ai_context_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    context_type VARCHAR(50) NOT NULL,
    context_data JSONB NOT NULL,
    embedding VECTOR(768), -- For semantic search (requires pgvector extension)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (TIMEZONE('utc'::text, NOW()) + INTERVAL '24 hours')
);

-- AI Metrics Table - Track AI performance and usage
CREATE TABLE IF NOT EXISTS ai_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_behavior_data_user_id ON behavior_data(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_data_activity_type ON behavior_data(activity_type);
CREATE INDEX IF NOT EXISTS idx_behavior_data_timestamp ON behavior_data(timestamp);

CREATE INDEX IF NOT EXISTS idx_behavior_profiles_user_id ON behavior_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_profiles_risk_level ON behavior_profiles(risk_level);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_expires_at ON ai_insights(expires_at);

CREATE INDEX IF NOT EXISTS idx_drift_predictions_user_id ON drift_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_drift_predictions_risk_level ON drift_predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_drift_predictions_created_at ON drift_predictions(created_at);

CREATE INDEX IF NOT EXISTS idx_future_plans_user_id ON future_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_future_plans_status ON future_plans(status);

CREATE INDEX IF NOT EXISTS idx_ai_context_cache_user_id ON ai_context_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_context_cache_context_type ON ai_context_cache(context_type);
CREATE INDEX IF NOT EXISTS idx_ai_context_cache_expires_at ON ai_context_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_ai_metrics_user_id ON ai_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_type ON ai_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_timestamp ON ai_metrics(timestamp);

-- Enable RLS for all AI tables
ALTER TABLE behavior_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE drift_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_context_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for behavior_data
CREATE POLICY "Users can view their own behavior data"
    ON behavior_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behavior data"
    ON behavior_data FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own behavior data"
    ON behavior_data FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own behavior data"
    ON behavior_data FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for behavior_profiles
CREATE POLICY "Users can view their own behavior profiles"
    ON behavior_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behavior profiles"
    ON behavior_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own behavior profiles"
    ON behavior_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own behavior profiles"
    ON behavior_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for ai_insights
CREATE POLICY "Users can view their own AI insights"
    ON ai_insights FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI insights"
    ON ai_insights FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI insights"
    ON ai_insights FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI insights"
    ON ai_insights FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for drift_predictions
CREATE POLICY "Users can view their own drift predictions"
    ON drift_predictions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drift predictions"
    ON drift_predictions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drift predictions"
    ON drift_predictions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drift predictions"
    ON drift_predictions FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for future_plans
CREATE POLICY "Users can view their own future plans"
    ON future_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own future plans"
    ON future_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own future plans"
    ON future_plans FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own future plans"
    ON future_plans FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for ai_context_cache
CREATE POLICY "Users can view their own AI context cache"
    ON ai_context_cache FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI context cache"
    ON ai_context_cache FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI context cache"
    ON ai_context_cache FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI context cache"
    ON ai_context_cache FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for ai_metrics
CREATE POLICY "Users can view their own AI metrics"
    ON ai_metrics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI metrics"
    ON ai_metrics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI metrics"
    ON ai_metrics FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI metrics"
    ON ai_metrics FOR DELETE
    USING (auth.uid() = user_id);

-- Create cleanup function for expired data
CREATE OR REPLACE FUNCTION cleanup_expired_ai_data()
RETURNS void AS $$
BEGIN
    -- Clean up expired AI insights
    DELETE FROM ai_insights WHERE expires_at < NOW();
    
    -- Clean up expired AI context cache
    DELETE FROM ai_context_cache WHERE expires_at < NOW();
    
    -- Clean up old behavior data (older than 90 days)
    DELETE FROM behavior_data WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Clean up old AI metrics (older than 30 days)
    DELETE FROM ai_metrics WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup_ai_data', '0 2 * * *', 'SELECT cleanup_expired_ai_data();');

-- Create trigger to update behavior_profiles updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_behavior_profiles_updated_at
    BEFORE UPDATE ON behavior_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_future_plans_updated_at
    BEFORE UPDATE ON future_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE behavior_data IS 'Stores user behavior data for AI pattern analysis';
COMMENT ON TABLE behavior_profiles IS 'Stores analyzed behavior patterns and drift predictions';
COMMENT ON TABLE ai_insights IS 'Stores AI-generated insights and recommendations';
COMMENT ON TABLE drift_predictions IS 'Stores drift predictions and intervention recommendations';
COMMENT ON TABLE future_plans IS 'Stores AI-generated future plans and strategies';
COMMENT ON TABLE ai_context_cache IS 'Caches user context for faster AI responses';
COMMENT ON TABLE ai_metrics IS 'Tracks AI performance and usage metrics';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'AI backend database schema created successfully!';
    RAISE NOTICE 'Tables created: behavior_data, behavior_profiles, ai_insights, drift_predictions, future_plans, ai_context_cache, ai_metrics';
    RAISE NOTICE 'All tables have RLS enabled with appropriate policies';
    RAISE NOTICE 'Cleanup function created for expired data';
END $$; 