-- Verify custom_challenges table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'custom_challenges'
ORDER BY ordinal_position; 