/*
  # Add Automatic Points Award for Badges

  1. Changes
    - Create trigger to automatically award points when a badge is earned
    - Points from badges are added to user's balance automatically
  
  2. Notes
    - When a user earns a badge, they automatically receive the badge's point value
    - This incentivizes badge collection and provides a natural points flow
  
  3. Security
    - Function runs with SECURITY DEFINER to ensure it has permission to update points
*/

-- Function to award points when badge is earned
CREATE OR REPLACE FUNCTION award_badge_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_badge_points integer;
BEGIN
  -- Get the points value of the badge
  SELECT points INTO v_badge_points
  FROM badges
  WHERE id = NEW.badge_id;
  
  -- Award points to user
  UPDATE user_profiles
  SET 
    points_balance = COALESCE(points_balance, 0) + v_badge_points,
    points_earned_total = COALESCE(points_earned_total, 0) + v_badge_points
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_badges insert
DROP TRIGGER IF EXISTS trigger_award_badge_points ON user_badges;
CREATE TRIGGER trigger_award_badge_points
  AFTER INSERT ON user_badges
  FOR EACH ROW
  EXECUTE FUNCTION award_badge_points();
