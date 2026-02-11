/*
  # Add Poetry Quiz System

  ## Overview
  Creates a comprehensive quiz system for poetry education and community engagement.
  Users can take quizzes about poetry forms, famous poets, literary devices, and more.
  
  ## New Tables
  
  ### `poetry_quizzes`
  Main quiz metadata table
  - `id` (uuid, primary key)
  - `title` (text) - Quiz title
  - `description` (text) - Quiz description
  - `category` (text) - Category: 'forms', 'poets', 'devices', 'history', 'general'
  - `difficulty` (text) - Difficulty: 'beginner', 'intermediate', 'advanced'
  - `time_limit_seconds` (integer) - Time limit in seconds (null = no limit)
  - `points_reward` (integer) - Points awarded for completion
  - `passing_score` (integer) - Minimum score to pass (percentage)
  - `is_active` (boolean) - Whether quiz is active
  - `created_by` (uuid, foreign key to auth.users)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `quiz_questions`
  Questions for each quiz
  - `id` (uuid, primary key)
  - `quiz_id` (uuid, foreign key to poetry_quizzes)
  - `question_text` (text) - The question
  - `question_order` (integer) - Order in quiz
  - `option_a` (text) - First option
  - `option_b` (text) - Second option
  - `option_c` (text) - Third option
  - `option_d` (text) - Fourth option
  - `correct_answer` (text) - 'A', 'B', 'C', or 'D'
  - `explanation` (text) - Explanation of correct answer
  - `created_at` (timestamptz)

  ### `quiz_attempts`
  User quiz attempts and scores
  - `id` (uuid, primary key)
  - `quiz_id` (uuid, foreign key to poetry_quizzes)
  - `user_id` (uuid, foreign key to auth.users)
  - `score` (integer) - Score achieved (percentage)
  - `correct_answers` (integer) - Number of correct answers
  - `total_questions` (integer) - Total questions in quiz
  - `time_taken_seconds` (integer) - Time taken to complete
  - `passed` (boolean) - Whether user passed
  - `answers` (jsonb) - User's answers {question_id: answer}
  - `completed_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can view active quizzes
  - Users can view their own attempts
  - Only quiz creators can manage their quizzes
  - Public leaderboard access

  ## Indexes
  - Foreign key indexes for performance
  - Quiz category and difficulty indexes for filtering
  - User attempts index for leaderboard queries
*/

-- Create poetry_quizzes table
CREATE TABLE IF NOT EXISTS poetry_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('forms', 'poets', 'devices', 'history', 'general')),
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  time_limit_seconds integer,
  points_reward integer DEFAULT 100,
  passing_score integer DEFAULT 70,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES poetry_quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_order integer NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation text,
  created_at timestamptz DEFAULT now()
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES poetry_quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  correct_answers integer NOT NULL,
  total_questions integer NOT NULL,
  time_taken_seconds integer,
  passed boolean DEFAULT false,
  answers jsonb DEFAULT '{}'::jsonb,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE poetry_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for poetry_quizzes
CREATE POLICY "Anyone can view active quizzes"
  ON poetry_quizzes FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Quiz creators can view their own quizzes"
  ON poetry_quizzes FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create quizzes"
  ON poetry_quizzes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Quiz creators can update their own quizzes"
  ON poetry_quizzes FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for quiz_questions
CREATE POLICY "Anyone can view questions for active quizzes"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poetry_quizzes
      WHERE poetry_quizzes.id = quiz_questions.quiz_id
      AND poetry_quizzes.is_active = true
    )
  );

CREATE POLICY "Quiz creators can manage questions"
  ON quiz_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM poetry_quizzes
      WHERE poetry_quizzes.id = quiz_questions.quiz_id
      AND poetry_quizzes.created_by = auth.uid()
    )
  );

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all attempts for leaderboard"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order ON quiz_questions(quiz_id, question_order);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON quiz_attempts(quiz_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON poetry_quizzes(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON poetry_quizzes(difficulty) WHERE is_active = true;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quiz_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_poetry_quizzes_updated_at ON poetry_quizzes;
CREATE TRIGGER update_poetry_quizzes_updated_at
  BEFORE UPDATE ON poetry_quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_updated_at();

-- Insert sample poetry quizzes
INSERT INTO poetry_quizzes (title, description, category, difficulty, time_limit_seconds, points_reward, passing_score, is_active) VALUES
('Poetic Forms Basics', 'Test your knowledge of basic poetic forms like sonnets, haikus, and free verse.', 'forms', 'beginner', 300, 50, 70, true),
('Famous Irish Poets', 'How well do you know the great Irish poets? Test your knowledge of Yeats, Heaney, and more.', 'poets', 'intermediate', 600, 100, 75, true),
('Literary Devices Master', 'Identify and understand metaphors, similes, alliteration, and other poetic devices.', 'devices', 'advanced', 900, 150, 80, true),
('Poetry History 101', 'Journey through the history of poetry from ancient times to modern day.', 'history', 'intermediate', 600, 100, 70, true),
('Quick Poetry Quiz', 'A quick 5-question quiz to test your general poetry knowledge.', 'general', 'beginner', 180, 25, 60, true);

-- Insert sample questions for "Poetic Forms Basics" quiz
INSERT INTO quiz_questions (quiz_id, question_text, question_order, option_a, option_b, option_c, option_d, correct_answer, explanation)
SELECT 
  id,
  'How many lines does a traditional sonnet have?',
  1,
  '12 lines',
  '14 lines',
  '16 lines',
  '18 lines',
  'B',
  'A sonnet traditionally has 14 lines, typically written in iambic pentameter.'
FROM poetry_quizzes WHERE title = 'Poetic Forms Basics';

INSERT INTO quiz_questions (quiz_id, question_text, question_order, option_a, option_b, option_c, option_d, correct_answer, explanation)
SELECT 
  id,
  'What is the syllable pattern of a traditional haiku?',
  2,
  '5-5-5',
  '7-7-7',
  '5-7-5',
  '7-5-7',
  'C',
  'A haiku follows a 5-7-5 syllable pattern across three lines.'
FROM poetry_quizzes WHERE title = 'Poetic Forms Basics';

INSERT INTO quiz_questions (quiz_id, question_text, question_order, option_a, option_b, option_c, option_d, correct_answer, explanation)
SELECT 
  id,
  'Which poetic form does NOT follow a specific rhyme scheme?',
  3,
  'Limerick',
  'Free Verse',
  'Villanelle',
  'Terza Rima',
  'B',
  'Free verse poetry does not follow any specific rhyme scheme or meter.'
FROM poetry_quizzes WHERE title = 'Poetic Forms Basics';

INSERT INTO quiz_questions (quiz_id, question_text, question_order, option_a, option_b, option_c, option_d, correct_answer, explanation)
SELECT 
  id,
  'What rhyme scheme does a Shakespearean sonnet follow?',
  4,
  'ABAB CDCD EFEF GG',
  'ABBA ABBA CDC DCD',
  'AABB CCDD EEFF GG',
  'ABAB ABAB ABAB AA',
  'A',
  'A Shakespearean sonnet follows the rhyme scheme ABAB CDCD EFEF GG.'
FROM poetry_quizzes WHERE title = 'Poetic Forms Basics';

INSERT INTO quiz_questions (quiz_id, question_text, question_order, option_a, option_b, option_c, option_d, correct_answer, explanation)
SELECT 
  id,
  'How many lines does a limerick have?',
  5,
  '3 lines',
  '4 lines',
  '5 lines',
  '6 lines',
  'C',
  'A limerick is a humorous poem with exactly 5 lines following an AABBA rhyme scheme.'
FROM poetry_quizzes WHERE title = 'Poetic Forms Basics';

-- Insert sample questions for "Famous Irish Poets" quiz
INSERT INTO quiz_questions (quiz_id, question_text, question_order, option_a, option_b, option_c, option_d, correct_answer, explanation)
SELECT 
  id,
  'Who wrote "The Second Coming" and "Sailing to Byzantium"?',
  1,
  'Seamus Heaney',
  'W.B. Yeats',
  'Patrick Kavanagh',
  'Eavan Boland',
  'B',
  'William Butler Yeats wrote these famous poems and won the Nobel Prize in Literature in 1923.'
FROM poetry_quizzes WHERE title = 'Famous Irish Poets';

INSERT INTO quiz_questions (quiz_id, question_text, question_order, option_a, option_b, option_c, option_d, correct_answer, explanation)
SELECT 
  id,
  'Which Irish poet won the Nobel Prize in Literature in 1995?',
  2,
  'W.B. Yeats',
  'Patrick Kavanagh',
  'Seamus Heaney',
  'Paul Muldoon',
  'C',
  'Seamus Heaney won the Nobel Prize in Literature in 1995 for his profound poetic works.'
FROM poetry_quizzes WHERE title = 'Famous Irish Poets';

-- Insert sample questions for "Literary Devices Master" quiz
INSERT INTO quiz_questions (quiz_id, question_text, question_order, option_a, option_b, option_c, option_d, correct_answer, explanation)
SELECT 
  id,
  'What literary device is used in: "The wind whispered through the trees"?',
  1,
  'Metaphor',
  'Personification',
  'Alliteration',
  'Hyperbole',
  'B',
  'Personification gives human qualities (whispering) to non-human things (wind).'
FROM poetry_quizzes WHERE title = 'Literary Devices Master';

INSERT INTO quiz_questions (quiz_id, question_text, question_order, option_a, option_b, option_c, option_d, correct_answer, explanation)
SELECT 
  id,
  'Which device uses "like" or "as" to make a comparison?',
  2,
  'Metaphor',
  'Simile',
  'Analogy',
  'Allegory',
  'B',
  'A simile uses "like" or "as" to compare two things, e.g., "brave as a lion".'
FROM poetry_quizzes WHERE title = 'Literary Devices Master';

-- Enable realtime for quiz tables
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_attempts;