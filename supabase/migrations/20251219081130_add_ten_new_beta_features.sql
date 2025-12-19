/*
  # Add 10 New Beta Features

  1. New Beta Features Added:
    - **Poetry Translation**: Translate poems to different languages using AI
    - **Rhyme Dictionary**: Advanced rhyme and near-rhyme suggestions for poetry writing
    - **Mood Board Generator**: Create visual inspiration boards based on poem themes
    - **Reading Time Estimator**: Estimate reading time and analyze reading level
    - **Verse Variations**: Generate AI-powered alternative versions of verses
    - **Performance Mode**: Practice performing poetry with timing and recording features
    - **Poetry Challenges**: Participate in daily/weekly writing challenges
    - **Word Cloud Visualizer**: Generate beautiful word clouds from your poems
    - **Poetry Contests**: Enter and vote on community poetry contests
    - **Historical Forms Explorer**: Explore historical poetry forms with examples and guidance
  
  2. Changes:
    - Inserts 10 new beta feature records into the beta_features table
    - All features are enabled by default for beta testers
    - Each feature has a descriptive name and helpful description
  
  3. Security:
    - No changes to RLS policies (existing policies already secure these records)
    - Uses IF NOT EXISTS pattern to safely add features
*/

-- Insert new beta features (only if they don't already exist)
DO $$
BEGIN
  -- Poetry Translation
  IF NOT EXISTS (SELECT 1 FROM beta_features WHERE name = 'poetry_translation') THEN
    INSERT INTO beta_features (name, description, is_enabled)
    VALUES ('poetry_translation', 'Translate your poems into different languages while preserving poetic structure and meaning', true);
  END IF;

  -- Rhyme Dictionary
  IF NOT EXISTS (SELECT 1 FROM beta_features WHERE name = 'rhyme_dictionary') THEN
    INSERT INTO beta_features (name, description, is_enabled)
    VALUES ('rhyme_dictionary', 'Advanced rhyme finder with perfect rhymes, near rhymes, and assonance suggestions', true);
  END IF;

  -- Mood Board Generator
  IF NOT EXISTS (SELECT 1 FROM beta_features WHERE name = 'mood_board_generator') THEN
    INSERT INTO beta_features (name, description, is_enabled)
    VALUES ('mood_board_generator', 'Create visual inspiration boards based on your poem themes and emotions', true);
  END IF;

  -- Reading Time Estimator
  IF NOT EXISTS (SELECT 1 FROM beta_features WHERE name = 'reading_time_estimator') THEN
    INSERT INTO beta_features (name, description, is_enabled)
    VALUES ('reading_time_estimator', 'Calculate reading time and analyze readability metrics for your poems', true);
  END IF;

  -- Verse Variations
  IF NOT EXISTS (SELECT 1 FROM beta_features WHERE name = 'verse_variations') THEN
    INSERT INTO beta_features (name, description, is_enabled)
    VALUES ('verse_variations', 'Generate AI-powered alternative versions of your verses with different tones and styles', true);
  END IF;

  -- Performance Mode
  IF NOT EXISTS (SELECT 1 FROM beta_features WHERE name = 'performance_mode') THEN
    INSERT INTO beta_features (name, description, is_enabled)
    VALUES ('performance_mode', 'Practice performing your poetry with timing tools, metronome, and recording features', true);
  END IF;

  -- Poetry Challenges
  IF NOT EXISTS (SELECT 1 FROM beta_features WHERE name = 'poetry_challenges') THEN
    INSERT INTO beta_features (name, description, is_enabled)
    VALUES ('poetry_challenges', 'Join daily and weekly poetry writing challenges to improve your craft', true);
  END IF;

  -- Word Cloud Visualizer
  IF NOT EXISTS (SELECT 1 FROM beta_features WHERE name = 'word_cloud_visualizer') THEN
    INSERT INTO beta_features (name, description, is_enabled)
    VALUES ('word_cloud_visualizer', 'Generate beautiful word clouds to visualize the key themes in your poems', true);
  END IF;

  -- Poetry Contests
  IF NOT EXISTS (SELECT 1 FROM beta_features WHERE name = 'poetry_contests') THEN
    INSERT INTO beta_features (name, description, is_enabled)
    VALUES ('poetry_contests', 'Enter community poetry contests and vote on your favorite submissions', true);
  END IF;

  -- Historical Forms Explorer
  IF NOT EXISTS (SELECT 1 FROM beta_features WHERE name = 'historical_forms_explorer') THEN
    INSERT INTO beta_features (name, description, is_enabled)
    VALUES ('historical_forms_explorer', 'Explore historical poetry forms from different cultures with examples and writing guides', true);
  END IF;
END $$;