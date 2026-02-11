/*
  # Add RLS Policies for All New Feature Tables

  This migration enables RLS and adds security policies for all new tables.
*/

-- Enable RLS on all new tables
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE critiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE anthologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE anthology_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE zines ENABLE ROW LEVEL SECURITY;
ALTER TABLE zine_poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- User Profiles: Allow public read access
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON user_profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Poems: Allow viewing published public poems
DROP POLICY IF EXISTS "Public poems are viewable by all authenticated users" ON poems;
CREATE POLICY "Public poems are viewable by all authenticated users"
  ON poems FOR SELECT
  TO authenticated
  USING (is_public = true AND status = 'published');

-- Follows policies
CREATE POLICY "Users can view all follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own follows"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = (select auth.uid()));

CREATE POLICY "Users can delete own follows"
  ON follows FOR DELETE
  TO authenticated
  USING (follower_id = (select auth.uid()));

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own bookmarks"
  ON bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Reading Lists policies
CREATE POLICY "Users can view own or public reading lists"
  ON reading_lists FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR is_public = true);

CREATE POLICY "Users can create own reading lists"
  ON reading_lists FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own reading lists"
  ON reading_lists FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own reading lists"
  ON reading_lists FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Reading List Items policies
CREATE POLICY "Users can view items in accessible lists"
  ON reading_list_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reading_lists
      WHERE reading_lists.id = reading_list_items.reading_list_id
      AND (reading_lists.user_id = (select auth.uid()) OR reading_lists.is_public = true)
    )
  );

CREATE POLICY "Users can add items to own lists"
  ON reading_list_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reading_lists
      WHERE reading_lists.id = reading_list_items.reading_list_id
      AND reading_lists.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete items from own lists"
  ON reading_list_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reading_lists
      WHERE reading_lists.id = reading_list_items.reading_list_id
      AND reading_lists.user_id = (select auth.uid())
    )
  );

-- Poem Versions policies
CREATE POLICY "Users can view versions of own poems"
  ON poem_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_versions.poem_id
      AND poems.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create versions for own poems"
  ON poem_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poems
      WHERE poems.id = poem_versions.poem_id
      AND poems.user_id = (select auth.uid())
    )
  );

-- Workshops policies
CREATE POLICY "Users can view accessible workshops"
  ON workshops FOR SELECT
  TO authenticated
  USING (
    is_public = true
    OR creator_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM workshop_members
      WHERE workshop_members.workshop_id = workshops.id
      AND workshop_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create workshops"
  ON workshops FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = (select auth.uid()));

CREATE POLICY "Creators can update own workshops"
  ON workshops FOR UPDATE
  TO authenticated
  USING (creator_id = (select auth.uid()))
  WITH CHECK (creator_id = (select auth.uid()));

CREATE POLICY "Creators can delete own workshops"
  ON workshops FOR DELETE
  TO authenticated
  USING (creator_id = (select auth.uid()));

-- Workshop Members policies
CREATE POLICY "Users can view members of accessible workshops"
  ON workshop_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workshops
      WHERE workshops.id = workshop_members.workshop_id
      AND (
        workshops.is_public = true
        OR workshops.creator_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM workshop_members wm
          WHERE wm.workshop_id = workshops.id
          AND wm.user_id = (select auth.uid())
        )
      )
    )
  );

CREATE POLICY "Users can join workshops"
  ON workshop_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can leave workshops"
  ON workshop_members FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Workshop Submissions policies
CREATE POLICY "Members can view workshop submissions"
  ON workshop_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workshop_members
      WHERE workshop_members.workshop_id = workshop_submissions.workshop_id
      AND workshop_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Members can submit to workshops"
  ON workshop_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    submitted_by = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM workshop_members
      WHERE workshop_members.workshop_id = workshop_submissions.workshop_id
      AND workshop_members.user_id = (select auth.uid())
    )
  );

-- Critiques policies
CREATE POLICY "Members can view critiques in their workshops"
  ON critiques FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workshop_submissions ws
      JOIN workshop_members wm ON ws.workshop_id = wm.workshop_id
      WHERE ws.id = critiques.workshop_submission_id
      AND wm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Members can create critiques"
  ON critiques FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM workshop_submissions ws
      JOIN workshop_members wm ON ws.workshop_id = wm.workshop_id
      WHERE ws.id = critiques.workshop_submission_id
      AND wm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own critiques"
  ON critiques FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own critiques"
  ON critiques FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Collaborative Poems policies
CREATE POLICY "Users can view all collaborative poems"
  ON collaborative_poems FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create collaborative poems"
  ON collaborative_poems FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = (select auth.uid()));

CREATE POLICY "Creators can update own collaborative poems"
  ON collaborative_poems FOR UPDATE
  TO authenticated
  USING (creator_id = (select auth.uid()))
  WITH CHECK (creator_id = (select auth.uid()));

-- Poem Collaborators policies
CREATE POLICY "Users can view all collaborators"
  ON poem_collaborators FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add own contributions"
  ON poem_collaborators FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Collaboration Invitations policies
CREATE POLICY "Users can view invitations they sent or received"
  ON collaboration_invitations FOR SELECT
  TO authenticated
  USING (inviter_id = (select auth.uid()) OR invitee_id = (select auth.uid()));

CREATE POLICY "Users can create invitations for own poems"
  ON collaboration_invitations FOR INSERT
  TO authenticated
  WITH CHECK (inviter_id = (select auth.uid()));

CREATE POLICY "Invitees can update invitation status"
  ON collaboration_invitations FOR UPDATE
  TO authenticated
  USING (invitee_id = (select auth.uid()))
  WITH CHECK (invitee_id = (select auth.uid()));

-- Daily Prompts policies
CREATE POLICY "Anyone can view daily prompts"
  ON daily_prompts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors can create prompts"
  ON daily_prompts FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND (user_profiles.is_developer = true OR user_profiles.is_editor = true)
    )
  );

-- Prompt Responses policies
CREATE POLICY "Users can view all prompt responses"
  ON prompt_responses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own prompt responses"
  ON prompt_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Badges policies
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- User Badges policies
CREATE POLICY "Users can view all badges earned"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

-- Writing Streaks policies
CREATE POLICY "Users can view own streak"
  ON writing_streaks FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own streak"
  ON writing_streaks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own streak"
  ON writing_streaks FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Challenges policies
CREATE POLICY "Anyone can view challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors can create challenges"
  ON challenges FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND (user_profiles.is_developer = true OR user_profiles.is_editor = true)
    )
  );

-- Challenge Participations policies
CREATE POLICY "Users can view all challenge participations"
  ON challenge_participations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join challenges"
  ON challenge_participations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own participations"
  ON challenge_participations FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Writing Goals policies
CREATE POLICY "Users can view own goals"
  ON writing_goals FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own goals"
  ON writing_goals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own goals"
  ON writing_goals FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own goals"
  ON writing_goals FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Contests policies
CREATE POLICY "Anyone can view contests"
  ON contests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors can create contests"
  ON contests FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND (user_profiles.is_developer = true OR user_profiles.is_editor = true)
    )
  );

-- Contest Entries policies
CREATE POLICY "Anyone can view contest entries"
  ON contest_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can submit to contests"
  ON contest_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Contest Votes policies
CREATE POLICY "Anyone can view contest votes"
  ON contest_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote in contests"
  ON contest_votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can change their vote"
  ON contest_votes FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Events policies
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (host_id = (select auth.uid()));

CREATE POLICY "Hosts can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (host_id = (select auth.uid()))
  WITH CHECK (host_id = (select auth.uid()));

-- Event Attendees policies
CREATE POLICY "Anyone can view event attendees"
  ON event_attendees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can register for events"
  ON event_attendees FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can unregister from events"
  ON event_attendees FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Anthologies policies
CREATE POLICY "Anyone can view published anthologies"
  ON anthologies FOR SELECT
  TO authenticated
  USING (
    is_published = true
    OR curator_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_editor = true
    )
  );

CREATE POLICY "Editors can create anthologies"
  ON anthologies FOR INSERT
  TO authenticated
  WITH CHECK (
    curator_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND (user_profiles.is_developer = true OR user_profiles.is_editor = true)
    )
  );

CREATE POLICY "Curators can update own anthologies"
  ON anthologies FOR UPDATE
  TO authenticated
  USING (curator_id = (select auth.uid()))
  WITH CHECK (curator_id = (select auth.uid()));

-- Anthology Submissions policies
CREATE POLICY "Anyone can view submissions in published anthologies"
  ON anthology_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM anthologies
      WHERE anthologies.id = anthology_submissions.anthology_id
      AND (
        anthologies.is_published = true
        OR anthologies.curator_id = (select auth.uid())
      )
    )
  );

CREATE POLICY "Curators can add to own anthologies"
  ON anthology_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM anthologies
      WHERE anthologies.id = anthology_submissions.anthology_id
      AND anthologies.curator_id = (select auth.uid())
    )
  );

CREATE POLICY "Curators can remove from own anthologies"
  ON anthology_submissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM anthologies
      WHERE anthologies.id = anthology_submissions.anthology_id
      AND anthologies.curator_id = (select auth.uid())
    )
  );

-- Mentorships policies
CREATE POLICY "Users can view own mentorships"
  ON mentorships FOR SELECT
  TO authenticated
  USING (mentor_id = (select auth.uid()) OR mentee_id = (select auth.uid()));

CREATE POLICY "Users can request mentorship"
  ON mentorships FOR INSERT
  TO authenticated
  WITH CHECK (mentee_id = (select auth.uid()));

CREATE POLICY "Mentors and mentees can update mentorship"
  ON mentorships FOR UPDATE
  TO authenticated
  USING (mentor_id = (select auth.uid()) OR mentee_id = (select auth.uid()))
  WITH CHECK (mentor_id = (select auth.uid()) OR mentee_id = (select auth.uid()));

-- Zines policies
CREATE POLICY "Users can view public zines or own zines"
  ON zines FOR SELECT
  TO authenticated
  USING (is_public = true OR creator_id = (select auth.uid()));

CREATE POLICY "Users can create zines"
  ON zines FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = (select auth.uid()));

CREATE POLICY "Creators can update own zines"
  ON zines FOR UPDATE
  TO authenticated
  USING (creator_id = (select auth.uid()))
  WITH CHECK (creator_id = (select auth.uid()));

CREATE POLICY "Creators can delete own zines"
  ON zines FOR DELETE
  TO authenticated
  USING (creator_id = (select auth.uid()));

-- Zine Poems policies
CREATE POLICY "Users can view poems in accessible zines"
  ON zine_poems FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM zines
      WHERE zines.id = zine_poems.zine_id
      AND (zines.is_public = true OR zines.creator_id = (select auth.uid()))
    )
  );

CREATE POLICY "Creators can add poems to own zines"
  ON zine_poems FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM zines
      WHERE zines.id = zine_poems.zine_id
      AND zines.creator_id = (select auth.uid())
    )
  );

CREATE POLICY "Creators can remove poems from own zines"
  ON zine_poems FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM zines
      WHERE zines.id = zine_poems.zine_id
      AND zines.creator_id = (select auth.uid())
    )
  );

-- User Preferences policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
