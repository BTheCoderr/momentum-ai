-- Complete test script for pod system with RLS
BEGIN;

-- Create test user and set up auth
INSERT INTO auth.users (id, email)
VALUES ('d7bed83c-44a2-4645-9bd0-91d98234b42f', 'test@example.com')
ON CONFLICT (id) DO NOTHING;

-- Set up test authentication
SET request.jwt.claim.sub='d7bed83c-44a2-4645-9bd0-91d98234b42f';
SET request.jwt.claim.role='authenticated';

-- 1. Create a test pod
INSERT INTO pods (name, description, is_public)
VALUES ('Test Pod', 'A pod for testing', true)
RETURNING id, name;

-- 2. Add the test user as a member
INSERT INTO pod_members (pod_id, user_id)
SELECT 
    (SELECT id FROM pods WHERE name = 'Test Pod'),
    auth.uid()
RETURNING id, pod_id, user_id;

-- 3. Create a custom challenge for the pod
INSERT INTO custom_challenges (user_id, title, for_pod, pod_id)
SELECT 
    auth.uid(),
    'Test Challenge',
    true,
    (SELECT id FROM pods WHERE name = 'Test Pod')
RETURNING id, title, for_pod, user_id;

-- 4. Add challenge progress
INSERT INTO challenge_progress (user_id, challenge_id, completed_days)
SELECT 
    auth.uid(),
    (SELECT id FROM custom_challenges WHERE title = 'Test Challenge'),
    '{1,2,3}'
RETURNING id, user_id, challenge_id, completed_days;

-- 5. Verify RLS: Test SELECT permissions

-- Should show the pod (because it's public)
SELECT 'Test 1: Public pod visibility' as test_name;
SELECT * FROM pods WHERE name = 'Test Pod';

-- Should show pod membership
SELECT 'Test 2: Pod membership visibility' as test_name;
SELECT pm.*, p.name as pod_name
FROM pod_members pm
JOIN pods p ON p.id = pm.pod_id
WHERE p.name = 'Test Pod';

-- Should show the challenge
SELECT 'Test 3: Challenge visibility' as test_name;
SELECT cc.*, p.name as pod_name
FROM custom_challenges cc
LEFT JOIN pods p ON p.id = cc.pod_id
WHERE cc.title = 'Test Challenge';

-- Should show challenge progress
SELECT 'Test 4: Challenge progress visibility' as test_name;
SELECT cp.*, cc.title as challenge_title
FROM challenge_progress cp
JOIN custom_challenges cc ON cc.id = cp.challenge_id
WHERE cc.title = 'Test Challenge';

-- 6. Test RLS with different user
SET request.jwt.claim.sub='00000000-0000-0000-0000-000000000000';

-- Should only see public pod
SELECT 'Test 5: Other user pod visibility' as test_name;
SELECT * FROM pods WHERE name = 'Test Pod';

-- Should see no pod members
SELECT 'Test 6: Other user pod membership visibility' as test_name;
SELECT pm.*, p.name as pod_name
FROM pod_members pm
JOIN pods p ON p.id = pm.pod_id
WHERE p.name = 'Test Pod';

-- Should only see public challenges
SELECT 'Test 7: Other user challenge visibility' as test_name;
SELECT cc.*, p.name as pod_name
FROM custom_challenges cc
LEFT JOIN pods p ON p.id = cc.pod_id
WHERE cc.title = 'Test Challenge';

-- Should see no challenge progress
SELECT 'Test 8: Other user progress visibility' as test_name;
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