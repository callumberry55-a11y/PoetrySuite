/*
  # Add Publishing & Export Beta Features

  1. New Beta Features
    - **Manuscript Builder** - Compile poems into collections with custom ordering, sections, and table of contents
    - **Advanced Export Options** - Export to PDF, ePub, print-ready formats with professional typography and layouts
    - **Poetry Book Designer** - Create beautiful book layouts with cover design tools, fonts, and styling options
    - **Submission Tracker** - Track submissions to literary magazines, contests, and publishers with status updates and deadline reminders

  2. Notes
    - These features are marked as disabled initially (coming soon)
    - Beta testers will see these on the Beta page and can provide feedback
    - Features focus on helping poets publish and share their work professionally
*/

-- Insert Publishing & Export beta features
INSERT INTO beta_features (name, description, is_enabled)
VALUES 
  (
    'manuscript_builder',
    'Compile your poems into organized collections with custom ordering, sections, and automatic table of contents. Perfect for preparing poetry manuscripts.',
    false
  ),
  (
    'advanced_export_options',
    'Export your poetry to professional formats including PDF, ePub, and print-ready layouts with beautiful typography and customizable styling.',
    false
  ),
  (
    'poetry_book_designer',
    'Design stunning poetry books with built-in cover creator, font selection, page layout tools, and professional templates for self-publishing.',
    false
  ),
  (
    'submission_tracker',
    'Track your submissions to literary magazines, poetry contests, and publishers. Manage deadlines, response times, and acceptance rates all in one place.',
    false
  )
ON CONFLICT (name) DO NOTHING;