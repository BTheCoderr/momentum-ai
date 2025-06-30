-- Corrected Demo Data for Momentum AI
-- Run this directly in your Supabase SQL Editor
-- Uses the correct demo user ID that your app expects

-- Insert demo goals
INSERT INTO goals (id, user_id, title, description, status, progress, created_at, updated_at) VALUES 
(gen_random_uuid(), 'demo-user-app-store', 'Daily Exercise', 'Exercise for at least 30 minutes every day', 'active', 78, NOW(), NOW()),
(gen_random_uuid(), 'demo-user-app-store', 'Learn React Native', 'Master React Native development for mobile apps', 'active', 65, NOW(), NOW()),
(gen_random_uuid(), 'demo-user-app-store', 'Read 30 Minutes Daily', 'Read books for personal and professional development', 'active', 92, NOW(), NOW()),
(gen_random_uuid(), 'demo-user-app-store', 'Complete App Store Submission', 'Successfully submit Momentum AI to the App Store', 'completed', 100, NOW() - INTERVAL '3 days', NOW());

-- Insert demo user events (check-ins)
INSERT INTO user_events (user_id, event_type, timestamp, mood, progress, meta) VALUES 
('demo-user-app-store', 'daily_check_in', NOW() - INTERVAL '1 day', 'motivated', 85, '{"energy_level": 8, "wins": "Completed morning workout and felt amazing", "challenges": "Had to push through initial resistance", "xp_gained": 52}'),
('demo-user-app-store', 'daily_check_in', NOW() - INTERVAL '2 days', 'happy', 78, '{"energy_level": 9, "wins": "Had a breakthrough on my coding project", "challenges": "Managed time well despite distractions", "xp_gained": 49}'),
('demo-user-app-store', 'daily_check_in', NOW() - INTERVAL '3 days', 'focused', 82, '{"energy_level": 7, "wins": "Maintained deep work session for 2 hours", "challenges": "Stayed focused despite external noise", "xp_gained": 51}'),
('demo-user-app-store', 'daily_check_in', NOW() - INTERVAL '4 days', 'neutral', 70, '{"energy_level": 6, "wins": "Completed all essential tasks", "challenges": "Energy was lower than usual", "xp_gained": 45}'),
('demo-user-app-store', 'daily_check_in', NOW() - INTERVAL '5 days', 'motivated', 88, '{"energy_level": 8, "wins": "Started the day with clear priorities", "challenges": "Balanced multiple competing tasks", "xp_gained": 54}'),
('demo-user-app-store', 'daily_check_in', NOW() - INTERVAL '6 days', 'happy', 83, '{"energy_level": 8, "wins": "Successfully finished a challenging project", "challenges": "Time management with multiple deadlines", "xp_gained": 48}'),
('demo-user-app-store', 'daily_check_in', NOW() - INTERVAL '7 days', 'motivated', 79, '{"energy_level": 7, "wins": "Maintained consistency despite busy schedule", "challenges": "Stayed motivated during difficult tasks", "xp_gained": 46}');

-- Insert demo AI insights
INSERT INTO insights (user_id, summary, source, tags, meta, created_at) VALUES 
('demo-user-app-store', '🔥 Amazing progress! You''ve maintained excellent consistency and your energy levels are 40% higher on mornings when you complete your workout first.', 'ai_pattern_analysis', ARRAY['streak', 'morning_routine', 'energy_optimization'], '{"pattern_type": "time_optimization", "confidence": 0.92, "data_points": 15}', NOW() - INTERVAL '1 day'),
('demo-user-app-store', '💡 Pattern detected: Your productivity peaks on Mondays and Fridays. Consider scheduling your most challenging tasks during these high-energy periods.', 'ai_behavioral_analysis', ARRAY['productivity_patterns', 'weekly_trends', 'optimization'], '{"pattern_type": "weekly_optimization", "confidence": 0.87, "best_days": ["Monday", "Friday"]}', NOW() - INTERVAL '2 days'),
('demo-user-app-store', '🎯 Goal completion prediction: You''re 94% likely to complete your ''Read 30 Minutes Daily'' goal on time. Your current pace is excellent!', 'ai_goal_prediction', ARRAY['goal_prediction', 'success_likelihood', 'reading'], '{"prediction_confidence": 0.94, "completion_probability": "high"}', NOW() - INTERVAL '3 days'),
('demo-user-app-store', '🏆 Milestone achieved! You''ve completed your App Store submission goal. Your dedication to consistent progress made this possible!', 'ai_celebration', ARRAY['milestone', 'goal_completion', 'celebration'], '{"achievement_type": "major_goal", "celebration_level": "high"}', NOW() - INTERVAL '4 days'),
('demo-user-app-store', '⚡ Energy optimization: Your check-ins show you''re most productive when you start with physical activity. This pattern is worth protecting and building around.', 'ai_energy_analysis', ARRAY['energy_management', 'routine_optimization', 'productivity'], '{"pattern_type": "energy_optimization", "recommended_schedule": "morning_exercise_first"}', NOW() - INTERVAL '5 days');

-- Verify the data was inserted
SELECT 'Goals Created' as table_name, COUNT(*) as count FROM goals WHERE user_id = 'demo-user-app-store'
UNION ALL
SELECT 'User Events Created', COUNT(*) FROM user_events WHERE user_id = 'demo-user-app-store'  
UNION ALL
SELECT 'Insights Created', COUNT(*) FROM insights WHERE user_id = 'demo-user-app-store'; 