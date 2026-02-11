/*
  # Add Sample Content for New Features (v3 - Fixed)

  ## Purpose
  Populate new features with sample data so users can see and interact with them immediately.

  ## Sample Data Added
  1. Book Clubs - 3 sample clubs covering different poetry genres
  2. Study Groups - 3 groups for learning different poetry forms
  3. Poetry Events - 5 upcoming events (workshops, readings, contests)
  4. Forum Topics - 8 topics across different categories
  5. Poetry Collections - 2 curated collections
  
  ## Note
  All sample data uses the first available user ID as the creator.
*/

-- Create a function to safely add sample data
CREATE OR REPLACE FUNCTION add_sample_content_final()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_user_id uuid;
  v_poem_id uuid;
  v_collection_id uuid;
  v_category_id uuid;
BEGIN
  -- Get first user
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No users found, skipping sample data';
    RETURN;
  END IF;

  -- Add Book Clubs
  INSERT INTO book_clubs (name, description, created_by, is_private, current_book, meeting_schedule)
  VALUES 
    ('Modern Poetry Enthusiasts', 'Exploring contemporary poetry and emerging voices', v_user_id, false, 'Ocean Vuong - Night Sky with Exit Wounds', 'Every Tuesday at 7 PM'),
    ('Classic Verse Society', 'Reading and discussing the masters of poetry from past centuries', v_user_id, false, 'Emily Dickinson - Complete Poems', 'First Sunday of each month'),
    ('Haiku & Short Forms', 'Appreciating the beauty of brevity in poetry', v_user_id, false, 'Matsuo Basho - Selected Haiku', 'Weekly on Thursdays')
  ON CONFLICT DO NOTHING;

  -- Add Study Groups (using correct columns: topic instead of focus_area, no meeting_schedule)
  INSERT INTO study_groups (name, description, created_by, is_private, topic)
  VALUES 
    ('Sonnet Workshop', 'Master the art of writing sonnets through practice and feedback', v_user_id, false, 'Shakespearean & Petrarchan sonnets'),
    ('Free Verse Lab', 'Exploring the freedom and structure of free verse poetry', v_user_id, false, 'Contemporary free verse techniques'),
    ('Villanelle Circle', 'Learn to write compelling villanelles with group support', v_user_id, false, 'Villanelle form and variations')
  ON CONFLICT DO NOTHING;

  -- Add Poetry Events (using correct columns: organizer_id, start_time/end_time, is_virtual, is_public)
  INSERT INTO poetry_events (title, description, organizer_id, event_type, start_time, end_time, location, is_virtual, is_public, max_attendees)
  VALUES 
    ('Spring Poetry Slam', 'Annual poetry slam competition with cash prizes', v_user_id, 'competition', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '3 hours', 'City Arts Center', false, true, 100),
    ('Ekphrastic Poetry Workshop', 'Learn to write poetry inspired by visual art', v_user_id, 'workshop', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '2 hours', 'Virtual - Zoom', true, true, 30),
    ('Open Mic Night', 'Share your poetry in a supportive environment', v_user_id, 'reading', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '2 hours', 'The Poetry Cafe', false, true, 50),
    ('Crafting Memorable Imagery', 'Workshop on using vivid imagery in your poems', v_user_id, 'workshop', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '2 hours', 'Virtual - Zoom', true, true, 25),
    ('Annual Poetry Anthology Submission', 'Submit your best work for our yearly anthology', v_user_id, 'competition', NOW() + INTERVAL '60 days', NOW() + INTERVAL '90 days', 'Online Submission', true, true, 500)
  ON CONFLICT DO NOTHING;

  -- Add Forum Topics for General Discussion
  SELECT id INTO v_category_id FROM forum_categories WHERE name = 'General Discussion' LIMIT 1;
  IF v_category_id IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, content, view_count, last_activity_at)
    VALUES 
      (v_category_id, v_user_id, 'Welcome to the Poetry Community!', 'Hello everyone! Welcome to our poetry discussion forum. Feel free to introduce yourself and share what brings you to poetry.', 42, NOW()),
      (v_category_id, v_user_id, 'What are you reading this week?', 'Share the poetry collections or individual poems you''re currently enjoying. I just started Mary Oliver''s "Devotions" and it''s beautiful!', 28, NOW() - INTERVAL '2 hours')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Add Forum Topics for Writing Help
  SELECT id INTO v_category_id FROM forum_categories WHERE name = 'Writing Help' LIMIT 1;
  IF v_category_id IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, content, view_count, last_activity_at)
    VALUES 
      (v_category_id, v_user_id, 'Tips for breaking writer''s block?', 'I''ve been staring at a blank page for days. What techniques do you use when you''re stuck?', 56, NOW() - INTERVAL '1 hour'),
      (v_category_id, v_user_id, 'Finding your unique voice', 'How did you discover your distinctive voice as a poet? I feel like I''m imitating others too much.', 34, NOW() - INTERVAL '3 hours')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Add Forum Topics for Forms & Techniques
  SELECT id INTO v_category_id FROM forum_categories WHERE name = 'Forms & Techniques' LIMIT 1;
  IF v_category_id IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, content, view_count, last_activity_at, is_pinned)
    VALUES 
      (v_category_id, v_user_id, 'Sonnet Structure Guide', 'A comprehensive guide to writing sonnets, including Shakespearean and Petrarchan forms with examples.', 189, NOW() - INTERVAL '1 day', true),
      (v_category_id, v_user_id, 'Mastering Enjambment', 'Let''s discuss the use of enjambment to create flow and meaning in poetry. Share your favorite examples!', 67, NOW() - INTERVAL '5 hours', false)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Add Forum Topics for Show & Tell
  SELECT id INTO v_category_id FROM forum_categories WHERE name = 'Show & Tell' LIMIT 1;
  IF v_category_id IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, content, view_count, last_activity_at)
    VALUES 
      (v_category_id, v_user_id, 'Poem of the Week: "The Road Not Taken"', 'Robert Frost''s classic about choices and their consequences. What''s your interpretation?', 123, NOW() - INTERVAL '6 hours'),
      (v_category_id, v_user_id, 'Hidden Gem Poets You Should Know', 'Share lesser-known poets whose work deserves more attention. I''ll start: Lucille Clifton!', 45, NOW() - INTERVAL '4 hours')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Add Poetry Collections (if poems exist)
  SELECT id INTO v_poem_id FROM poems LIMIT 1;
  IF v_poem_id IS NOT NULL THEN
    -- Add first collection
    INSERT INTO poetry_collections (user_id, name, description, is_public)
    VALUES (v_user_id, 'Nature''s Symphony', 'A collection of poems celebrating the natural world', true)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO v_collection_id FROM poetry_collections WHERE user_id = v_user_id AND name = 'Nature''s Symphony' LIMIT 1;
    IF v_collection_id IS NOT NULL THEN
      INSERT INTO collection_poems (collection_id, poem_id, order_index)
      SELECT v_collection_id, id, ROW_NUMBER() OVER () - 1
      FROM poems
      LIMIT 2
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Add second collection
    INSERT INTO poetry_collections (user_id, name, description, is_public)
    VALUES (v_user_id, 'Urban Reflections', 'Poetry inspired by city life and human connections', true)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO v_collection_id FROM poetry_collections WHERE user_id = v_user_id AND name = 'Urban Reflections' LIMIT 1;
    IF v_collection_id IS NOT NULL THEN
      INSERT INTO collection_poems (collection_id, poem_id, order_index)
      SELECT v_collection_id, id, ROW_NUMBER() OVER () - 1
      FROM poems
      OFFSET 2
      LIMIT 2
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RAISE NOTICE 'Sample content added successfully';
END;
$$;

-- Execute the function
SELECT add_sample_content_final();

-- Clean up
DROP FUNCTION add_sample_content_final();
