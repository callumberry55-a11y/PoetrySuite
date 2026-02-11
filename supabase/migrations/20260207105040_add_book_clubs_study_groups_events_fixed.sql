/*
  # Book Clubs, Study Groups, and Events (Fixed)

  1. New Tables
    - `book_clubs` - Virtual reading groups for poetry
    - `book_club_members` - Membership in book clubs
    - `book_club_discussions` - Discussions within book clubs
    - `study_groups` - Collaborative learning groups
    - `study_group_members` - Membership in study groups
    - `study_group_resources` - Shared learning resources
    - `poetry_events` - Poetry events and workshops
    - Update `event_attendees` if it exists

  2. Security
    - Enable RLS on all new tables
    - Add comprehensive policies for group management
*/

-- Book Clubs Table
CREATE TABLE IF NOT EXISTS book_clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private boolean DEFAULT false,
  max_members integer DEFAULT 50,
  current_book text DEFAULT '',
  meeting_schedule text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE book_clubs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_book_clubs_created_by ON book_clubs(created_by);
CREATE INDEX IF NOT EXISTS idx_book_clubs_private ON book_clubs(is_private) WHERE is_private = false;

-- Book Club Members Table
CREATE TABLE IF NOT EXISTS book_club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  CONSTRAINT book_club_members_unique UNIQUE (club_id, user_id)
);

ALTER TABLE book_club_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_book_club_members_club ON book_club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_book_club_members_user ON book_club_members(user_id);

-- Book Club Discussions Table
CREATE TABLE IF NOT EXISTS book_club_discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE book_club_discussions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_book_club_discussions_club ON book_club_discussions(club_id);
CREATE INDEX IF NOT EXISTS idx_book_club_discussions_user ON book_club_discussions(user_id);

-- Study Groups Table
CREATE TABLE IF NOT EXISTS study_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  topic text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private boolean DEFAULT false,
  max_members integer DEFAULT 20,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_study_groups_created_by ON study_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_study_groups_topic ON study_groups(topic);
CREATE INDEX IF NOT EXISTS idx_study_groups_private ON study_groups(is_private) WHERE is_private = false;

-- Study Group Members Table
CREATE TABLE IF NOT EXISTS study_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  CONSTRAINT study_group_members_unique UNIQUE (group_id, user_id)
);

ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_study_group_members_group ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user ON study_group_members(user_id);

-- Study Group Resources Table
CREATE TABLE IF NOT EXISTS study_group_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  resource_type text DEFAULT 'note',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE study_group_resources ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_study_group_resources_group ON study_group_resources(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_resources_type ON study_group_resources(resource_type);

-- Poetry Events Table
CREATE TABLE IF NOT EXISTS poetry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  event_type text DEFAULT 'workshop',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text DEFAULT '',
  is_virtual boolean DEFAULT false,
  virtual_link text DEFAULT '',
  organizer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_attendees integer,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE poetry_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_poetry_events_organizer ON poetry_events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_poetry_events_type ON poetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_poetry_events_time ON poetry_events(start_time);
CREATE INDEX IF NOT EXISTS idx_poetry_events_public ON poetry_events(is_public) WHERE is_public = true;

-- RLS Policies for book_clubs
DROP POLICY IF EXISTS "Users can view public book clubs" ON book_clubs;
CREATE POLICY "Users can view public book clubs"
  ON book_clubs FOR SELECT
  TO authenticated
  USING (is_private = false);

DROP POLICY IF EXISTS "Users can view book clubs they are members of" ON book_clubs;
CREATE POLICY "Users can view book clubs they are members of"
  ON book_clubs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_club_members
      WHERE book_club_members.club_id = book_clubs.id
      AND book_club_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create book clubs" ON book_clubs;
CREATE POLICY "Users can create book clubs"
  ON book_clubs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Club admins can update book clubs" ON book_clubs;
CREATE POLICY "Club admins can update book clubs"
  ON book_clubs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_club_members
      WHERE book_club_members.club_id = book_clubs.id
      AND book_club_members.user_id = auth.uid()
      AND book_club_members.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM book_club_members
      WHERE book_club_members.club_id = book_clubs.id
      AND book_club_members.user_id = auth.uid()
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
      AND book_club_members.user_id = auth.uid()
      AND book_club_members.role = 'admin'
    )
  );

-- RLS Policies for book_club_members
DROP POLICY IF EXISTS "Users can view club members if they are members" ON book_club_members;
CREATE POLICY "Users can view club members if they are members"
  ON book_club_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_club_members bcm
      WHERE bcm.club_id = book_club_members.club_id
      AND bcm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can join book clubs" ON book_club_members;
CREATE POLICY "Users can join book clubs"
  ON book_club_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave book clubs" ON book_club_members;
CREATE POLICY "Users can leave book clubs"
  ON book_club_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for book_club_discussions
DROP POLICY IF EXISTS "Club members can view discussions" ON book_club_discussions;
CREATE POLICY "Club members can view discussions"
  ON book_club_discussions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_club_members
      WHERE book_club_members.club_id = book_club_discussions.club_id
      AND book_club_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Club members can create discussions" ON book_club_discussions;
CREATE POLICY "Club members can create discussions"
  ON book_club_discussions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM book_club_members
      WHERE book_club_members.club_id = club_id
      AND book_club_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own discussions" ON book_club_discussions;
CREATE POLICY "Users can delete own discussions"
  ON book_club_discussions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for study_groups
DROP POLICY IF EXISTS "Users can view public study groups" ON study_groups;
CREATE POLICY "Users can view public study groups"
  ON study_groups FOR SELECT
  TO authenticated
  USING (is_private = false);

DROP POLICY IF EXISTS "Users can view study groups they are members of" ON study_groups;
CREATE POLICY "Users can view study groups they are members of"
  ON study_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_groups.id
      AND study_group_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create study groups" ON study_groups;
CREATE POLICY "Users can create study groups"
  ON study_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Group admins can update study groups" ON study_groups;
CREATE POLICY "Group admins can update study groups"
  ON study_groups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_groups.id
      AND study_group_members.user_id = auth.uid()
      AND study_group_members.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_groups.id
      AND study_group_members.user_id = auth.uid()
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
      AND study_group_members.user_id = auth.uid()
      AND study_group_members.role = 'admin'
    )
  );

-- RLS Policies for study_group_members
DROP POLICY IF EXISTS "Users can view group members if they are members" ON study_group_members;
CREATE POLICY "Users can view group members if they are members"
  ON study_group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members sgm
      WHERE sgm.group_id = study_group_members.group_id
      AND sgm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can join study groups" ON study_group_members;
CREATE POLICY "Users can join study groups"
  ON study_group_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave study groups" ON study_group_members;
CREATE POLICY "Users can leave study groups"
  ON study_group_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for study_group_resources
DROP POLICY IF EXISTS "Group members can view resources" ON study_group_resources;
CREATE POLICY "Group members can view resources"
  ON study_group_resources FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_group_resources.group_id
      AND study_group_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Group members can create resources" ON study_group_resources;
CREATE POLICY "Group members can create resources"
  ON study_group_resources FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = group_id
      AND study_group_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own resources" ON study_group_resources;
CREATE POLICY "Users can delete own resources"
  ON study_group_resources FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for poetry_events
DROP POLICY IF EXISTS "Users can view public events" ON poetry_events;
CREATE POLICY "Users can view public events"
  ON poetry_events FOR SELECT
  TO authenticated
  USING (is_public = true);

DROP POLICY IF EXISTS "Users can view events they are attending" ON poetry_events;
CREATE POLICY "Users can view events they are attending"
  ON poetry_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM event_attendees
      WHERE event_attendees.event_id = poetry_events.id
      AND event_attendees.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create events" ON poetry_events;
CREATE POLICY "Users can create events"
  ON poetry_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Event organizers can update events" ON poetry_events;
CREATE POLICY "Event organizers can update events"
  ON poetry_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Event organizers can delete events" ON poetry_events;
CREATE POLICY "Event organizers can delete events"
  ON poetry_events FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'book_club_discussions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE book_club_discussions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'study_group_resources'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE study_group_resources;
  END IF;
END $$;