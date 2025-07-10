-- Test data insertion and RLS policies
BEGIN;

-- Create a test user in auth.users (if it doesn't exist)
INSERT INTO auth.users (id, email)
VALUES ('d7bed83c-44a2-4645-9bd0-91d98234b42f', 'test@example.com')
ON CONFLICT (id) DO NOTHING;

-- Set up test authentication (simulating a logged-in user)
SET request.jwt.claim.sub='d7bed83c-44a2-4645-9bd0-91d98234b42f';
SET request.jwt.claim.role='authenticated';

-- Create a test pod
INSERT INTO pods (name, description, is_public)
VALUES ('Test Pod', 'A pod for testing', true)
RETURNING id, name;

-- Add a member to the pod
INSERT INTO pod_members (pod_id, user_id)
SELECT 
    (SELECT id FROM pods WHERE name = 'Test Pod'),
    auth.uid()
RETURNING id, pod_id, user_id;

-- Create a custom challenge for the pod
INSERT INTO custom_challenges (user_id, title, for_pod, pod_id)
SELECT 
    auth.uid(),
    'Test Challenge',
    true,
    (SELECT id FROM pods WHERE name = 'Test Pod')
RETURNING id, title, for_pod, user_id;

-- Add challenge progress
INSERT INTO challenge_progress (user_id, challenge_id, completed_days)
SELECT 
    auth.uid(),
    (SELECT id FROM custom_challenges WHERE title = 'Test Challenge'),
    '{1,2,3}'
RETURNING id, user_id, challenge_id, completed_days;

-- Test queries to verify RLS policies

-- Should return the test pod (public pod)
SELECT * FROM pods WHERE name = 'Test Pod';

-- Should return pod members for pods the user is in
SELECT pm.*, p.name as pod_name
FROM pod_members pm
JOIN pods p ON p.id = pm.pod_id
WHERE p.name = 'Test Pod';

-- Should return challenges visible to the user
SELECT cc.*, p.name as pod_name
FROM custom_challenges cc
LEFT JOIN pods p ON p.id = cc.pod_id
WHERE cc.title = 'Test Challenge';

-- Should return challenge progress for the user
SELECT cp.*, cc.title as challenge_title
FROM challenge_progress cp
JOIN custom_challenges cc ON cc.id = cp.challenge_id
WHERE cc.title = 'Test Challenge';

-- Reset authentication
RESET request.jwt.claim.sub;
RESET request.jwt.claim.role;

-- Clean up test user
DELETE FROM auth.users WHERE id = 'd7bed83c-44a2-4645-9bd0-91d98234b42f';

ROLLBACK; -- Roll back the test data so we don't pollute the database 