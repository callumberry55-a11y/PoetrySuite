/*
  # Optimize RLS Policies - Part 1: Book Clubs, Study Groups, Events

  Wrap auth.uid() calls with (select auth.uid()) to prevent re-evaluation per row.
  This significantly improves query performance at scale.
*/

-- =====================================================
-- Book Clubs
-- =====================================================

DROP POLICY IF EXISTS "Users can view book clubs they are members of" ON book_clubs;
CREATE POLICY "Users can view book clubs they are members of"
  ON book_clubs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_club_members
      WHERE book_club_members.club_id = book_clubs.id
      AND book_club_members.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create book clubs" ON book_clubs;
CREATE POLICY "Users can create book clubs"
  ON book_clubs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Club admins can update book clubs" ON book_clubs;
CREATE POLICY "Club admins can update book clubs"
  ON book_clubs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_club_members
      WHERE book_club_members.club_id = book_clubs.id
      AND book_club_members.user_id = (select auth.uid())
      AND book_club_members.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Club admins can delete book clubs" ON book_clubs;
CREATE POLICY "Club admins can delete book clubs"
  ON book_clubs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_club_members
      WHERE book_club_members.club_id = book_clubs.id
      AND book_club_members.user_id = (select auth.uid())
      AND book_club_members.role = 'admin'
    )
  );

-- =====================================================
-- Book Club Members
-- =====================================================

DROP POLICY IF EXISTS "Users can view club members if they are members" ON book_club_members;
CREATE POLICY "Users can view club members if they are members"
  ON book_club_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_club_members bcm
      WHERE bcm.club_id = book_club_members.club_id
      AND bcm.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can join book clubs" ON book_club_members;
CREATE POLICY "Users can join book clubs"
  ON book_club_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can leave book clubs" ON book_club_members;
CREATE POLICY "Users can leave book clubs"
  ON book_club_members FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Book Club Discussions
-- =====================================================

DROP POLICY IF EXISTS "Club members can view discussions" ON book_club_discussions;
CREATE POLICY "Club members can view discussions"
  ON book_club_discussions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_club_members
      WHERE book_club_members.club_id = book_club_discussions.club_id
      AND book_club_members.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Club members can create discussions" ON book_club_discussions;
CREATE POLICY "Club members can create discussions"
  ON book_club_discussions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM book_club_members
      WHERE book_club_members.club_id = book_club_discussions.club_id
      AND book_club_members.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own discussions" ON book_club_discussions;
CREATE POLICY "Users can delete own discussions"
  ON book_club_discussions FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Study Groups
-- =====================================================

DROP POLICY IF EXISTS "Users can view study groups they are members of" ON study_groups;
CREATE POLICY "Users can view study groups they are members of"
  ON study_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_groups.id
      AND study_group_members.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create study groups" ON study_groups;
CREATE POLICY "Users can create study groups"
  ON study_groups FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Group admins can update study groups" ON study_groups;
CREATE POLICY "Group admins can update study groups"
  ON study_groups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_groups.id
      AND study_group_members.user_id = (select auth.uid())
      AND study_group_members.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Group admins can delete study groups" ON study_groups;
CREATE POLICY "Group admins can delete study groups"
  ON study_groups FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_groups.id
      AND study_group_members.user_id = (select auth.uid())
      AND study_group_members.role = 'admin'
    )
  );

-- =====================================================
-- Study Group Members
-- =====================================================

DROP POLICY IF EXISTS "Users can view group members if they are members" ON study_group_members;
CREATE POLICY "Users can view group members if they are members"
  ON study_group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members sgm
      WHERE sgm.group_id = study_group_members.group_id
      AND sgm.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can join study groups" ON study_group_members;
CREATE POLICY "Users can join study groups"
  ON study_group_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can leave study groups" ON study_group_members;
CREATE POLICY "Users can leave study groups"
  ON study_group_members FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Study Group Resources
-- =====================================================

DROP POLICY IF EXISTS "Group members can view resources" ON study_group_resources;
CREATE POLICY "Group members can view resources"
  ON study_group_resources FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_group_resources.group_id
      AND study_group_members.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Group members can create resources" ON study_group_resources;
CREATE POLICY "Group members can create resources"
  ON study_group_resources FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_group_resources.group_id
      AND study_group_members.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own resources" ON study_group_resources;
CREATE POLICY "Users can delete own resources"
  ON study_group_resources FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Poetry Events
-- =====================================================

DROP POLICY IF EXISTS "Users can view events they are attending" ON poetry_events;
CREATE POLICY "Users can view events they are attending"
  ON poetry_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM event_attendees
      WHERE event_attendees.event_id = poetry_events.id
      AND event_attendees.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create events" ON poetry_events;
CREATE POLICY "Users can create events"
  ON poetry_events FOR INSERT
  TO authenticated
  WITH CHECK (organizer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Event organizers can update events" ON poetry_events;
CREATE POLICY "Event organizers can update events"
  ON poetry_events FOR UPDATE
  TO authenticated
  USING (organizer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Event organizers can delete events" ON poetry_events;
CREATE POLICY "Event organizers can delete events"
  ON poetry_events FOR DELETE
  TO authenticated
  USING (organizer_id = (select auth.uid()));