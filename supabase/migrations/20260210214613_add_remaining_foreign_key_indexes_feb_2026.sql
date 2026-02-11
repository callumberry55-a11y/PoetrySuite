/*
  # Add Remaining Foreign Key Indexes - February 2026

  ## Summary
  This migration adds covering indexes for 77 foreign keys that are currently unindexed.
  Foreign key indexes are critical for query performance, especially for JOIN operations
  and CASCADE delete/update operations.

  ## Foreign Keys Indexed

  ### AI System (3 indexes)
  - ai_conversations.user_id
  - ai_messages.conversation_id
  - ai_messages.user_id

  ### Anthologies (2 indexes)
  - anthologies.curator_id
  - anthology_submissions.poem_id

  ### Bookmarks (1 index)
  - bookmarks.poem_id

  ### Challenges (3 indexes)
  - challenge_participations.poem_id
  - challenge_participations.user_id
  - challenges.created_by

  ### Collaboration (4 indexes)
  - collaboration_invitations.collaborative_poem_id
  - collaboration_invitations.invitee_id
  - collaboration_invitations.inviter_id
  - collaborative_poems.creator_id

  ### Comments & Community (2 indexes)
  - comments.user_id
  - community_submissions.reviewed_by

  ### Contests (7 indexes)
  - contest_entries.poem_id
  - contest_entries.user_id
  - contest_votes.entry_id
  - contest_votes.user_id
  - contests.created_by
  - contests.participant_badge_id
  - contests.runner_up_badge_id
  - contests.winner_badge_id

  ### Critiques & Workshops (2 indexes)
  - critiques.user_id
  - critiques.workshop_submission_id

  ### Daily Prompts (1 index)
  - daily_prompts.created_by

  ### Events (2 indexes)
  - event_attendees.user_id
  - events.host_id

  ### External APIs (2 indexes)
  - external_api_keys.created_by
  - external_api_usage.api_key_id

  ### Feedback (1 index)
  - feedback.user_id

  ### Mentorships (1 index)
  - mentorships.mentee_id

  ### PaaS System (15 indexes)
  - paas_access_codes.created_by
  - paas_access_codes.used_by
  - paas_ai_banker_decisions.billing_period_id
  - paas_api_logs.api_key_id
  - paas_api_logs.developer_id
  - paas_api_usage.api_key_id
  - paas_billing_charges.billing_period_id
  - paas_developer_reserves.category_id
  - paas_developers.access_code_id
  - paas_point_grants.developer_id
  - paas_reserve_allocations.reserve_id
  - paas_reserve_transactions.reserve_id
  - paas_security_events.api_key_id
  - paas_security_events.manual_override_by
  - paas_transactions.api_key_id

  ### Poems (5 indexes)
  - poem_collaborators.collaborative_poem_id
  - poem_collaborators.user_id
  - poem_collections.collection_id
  - poem_tags.tag_id
  - poem_versions.poem_id

  ### Prompts (2 indexes)
  - prompt_responses.poem_id
  - prompt_responses.user_id

  ### Reading Lists (3 indexes)
  - reading_list_items.poem_id
  - reading_list_items.reading_list_id
  - reading_lists.user_id

  ### Stories (2 indexes)
  - stories.user_id
  - story_views.viewer_id

  ### Study Groups (1 index)
  - study_group_resources.user_id

  ### User Related (2 indexes)
  - user_badges.badge_id
  - user_purchases.item_id
  - user_tax_transactions.user_id

  ### Workshops (4 indexes)
  - workshop_members.user_id
  - workshop_submissions.poem_id
  - workshop_submissions.submitted_by
  - workshop_submissions.workshop_id
  - workshops.creator_id

  ### Writing (1 index)
  - writing_goals.user_id

  ### Zines (2 indexes)
  - zine_poems.poem_id
  - zines.creator_id

  ## Note on Recently Created Indexes
  The indexes created in the previous migration (20260210214338) may show as "unused"
  in the Supabase dashboard. This is expected for newly created indexes and they will
  be utilized as queries execute against these tables.
*/

-- =====================================================
-- AI System Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id 
  ON ai_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id 
  ON ai_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_ai_messages_user_id 
  ON ai_messages(user_id);

-- =====================================================
-- Anthology Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_anthologies_curator_id 
  ON anthologies(curator_id);

CREATE INDEX IF NOT EXISTS idx_anthology_submissions_poem_id 
  ON anthology_submissions(poem_id);

-- =====================================================
-- Bookmark Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_bookmarks_poem_id 
  ON bookmarks(poem_id);

-- =====================================================
-- Challenge Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_challenge_participations_poem_id 
  ON challenge_participations(poem_id);

CREATE INDEX IF NOT EXISTS idx_challenge_participations_user_id 
  ON challenge_participations(user_id);

CREATE INDEX IF NOT EXISTS idx_challenges_created_by 
  ON challenges(created_by);

-- =====================================================
-- Collaboration Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_collaborative_poem_id 
  ON collaboration_invitations(collaborative_poem_id);

CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_invitee_id 
  ON collaboration_invitations(invitee_id);

CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_inviter_id 
  ON collaboration_invitations(inviter_id);

CREATE INDEX IF NOT EXISTS idx_collaborative_poems_creator_id 
  ON collaborative_poems(creator_id);

-- =====================================================
-- Comment & Community Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_comments_user_id 
  ON comments(user_id);

CREATE INDEX IF NOT EXISTS idx_community_submissions_reviewed_by 
  ON community_submissions(reviewed_by);

-- =====================================================
-- Contest Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_contest_entries_poem_id 
  ON contest_entries(poem_id);

CREATE INDEX IF NOT EXISTS idx_contest_entries_user_id 
  ON contest_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_contest_votes_entry_id 
  ON contest_votes(entry_id);

CREATE INDEX IF NOT EXISTS idx_contest_votes_user_id 
  ON contest_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_contests_created_by 
  ON contests(created_by);

CREATE INDEX IF NOT EXISTS idx_contests_participant_badge_id 
  ON contests(participant_badge_id);

CREATE INDEX IF NOT EXISTS idx_contests_runner_up_badge_id 
  ON contests(runner_up_badge_id);

CREATE INDEX IF NOT EXISTS idx_contests_winner_badge_id 
  ON contests(winner_badge_id);

-- =====================================================
-- Critique & Workshop Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_critiques_user_id 
  ON critiques(user_id);

CREATE INDEX IF NOT EXISTS idx_critiques_workshop_submission_id 
  ON critiques(workshop_submission_id);

-- =====================================================
-- Daily Prompt Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_daily_prompts_created_by 
  ON daily_prompts(created_by);

-- =====================================================
-- Event Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id 
  ON event_attendees(user_id);

CREATE INDEX IF NOT EXISTS idx_events_host_id 
  ON events(host_id);

-- =====================================================
-- External API Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_external_api_keys_created_by 
  ON external_api_keys(created_by);

CREATE INDEX IF NOT EXISTS idx_external_api_usage_api_key_id 
  ON external_api_usage(api_key_id);

-- =====================================================
-- Feedback Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_feedback_user_id 
  ON feedback(user_id);

-- =====================================================
-- Mentorship Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_mentorships_mentee_id 
  ON mentorships(mentee_id);

-- =====================================================
-- PaaS System Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_paas_access_codes_created_by 
  ON paas_access_codes(created_by);

CREATE INDEX IF NOT EXISTS idx_paas_access_codes_used_by 
  ON paas_access_codes(used_by);

CREATE INDEX IF NOT EXISTS idx_paas_ai_banker_decisions_billing_period_id 
  ON paas_ai_banker_decisions(billing_period_id);

CREATE INDEX IF NOT EXISTS idx_paas_api_logs_api_key_id 
  ON paas_api_logs(api_key_id);

CREATE INDEX IF NOT EXISTS idx_paas_api_logs_developer_id 
  ON paas_api_logs(developer_id);

CREATE INDEX IF NOT EXISTS idx_paas_api_usage_api_key_id 
  ON paas_api_usage(api_key_id);

CREATE INDEX IF NOT EXISTS idx_paas_billing_charges_billing_period_id 
  ON paas_billing_charges(billing_period_id);

CREATE INDEX IF NOT EXISTS idx_paas_developer_reserves_category_id 
  ON paas_developer_reserves(category_id);

CREATE INDEX IF NOT EXISTS idx_paas_developers_access_code_id 
  ON paas_developers(access_code_id);

CREATE INDEX IF NOT EXISTS idx_paas_point_grants_developer_id 
  ON paas_point_grants(developer_id);

CREATE INDEX IF NOT EXISTS idx_paas_reserve_allocations_reserve_id 
  ON paas_reserve_allocations(reserve_id);

CREATE INDEX IF NOT EXISTS idx_paas_reserve_transactions_reserve_id 
  ON paas_reserve_transactions(reserve_id);

CREATE INDEX IF NOT EXISTS idx_paas_security_events_api_key_id 
  ON paas_security_events(api_key_id);

CREATE INDEX IF NOT EXISTS idx_paas_security_events_manual_override_by 
  ON paas_security_events(manual_override_by);

CREATE INDEX IF NOT EXISTS idx_paas_transactions_api_key_id 
  ON paas_transactions(api_key_id);

-- =====================================================
-- Poem Related Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_poem_collaborators_collaborative_poem_id 
  ON poem_collaborators(collaborative_poem_id);

CREATE INDEX IF NOT EXISTS idx_poem_collaborators_user_id 
  ON poem_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_poem_collections_collection_id 
  ON poem_collections(collection_id);

CREATE INDEX IF NOT EXISTS idx_poem_tags_tag_id 
  ON poem_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_poem_versions_poem_id 
  ON poem_versions(poem_id);

-- =====================================================
-- Prompt Response Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_prompt_responses_poem_id 
  ON prompt_responses(poem_id);

CREATE INDEX IF NOT EXISTS idx_prompt_responses_user_id 
  ON prompt_responses(user_id);

-- =====================================================
-- Reading List Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_reading_list_items_poem_id 
  ON reading_list_items(poem_id);

CREATE INDEX IF NOT EXISTS idx_reading_list_items_reading_list_id 
  ON reading_list_items(reading_list_id);

CREATE INDEX IF NOT EXISTS idx_reading_lists_user_id 
  ON reading_lists(user_id);

-- =====================================================
-- Story Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_stories_user_id 
  ON stories(user_id);

CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id 
  ON story_views(viewer_id);

-- =====================================================
-- Study Group Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_study_group_resources_user_id 
  ON study_group_resources(user_id);

-- =====================================================
-- User Related Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id 
  ON user_badges(badge_id);

CREATE INDEX IF NOT EXISTS idx_user_purchases_item_id 
  ON user_purchases(item_id);

CREATE INDEX IF NOT EXISTS idx_user_tax_transactions_user_id 
  ON user_tax_transactions(user_id);

-- =====================================================
-- Workshop Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_workshop_members_user_id 
  ON workshop_members(user_id);

CREATE INDEX IF NOT EXISTS idx_workshop_submissions_poem_id 
  ON workshop_submissions(poem_id);

CREATE INDEX IF NOT EXISTS idx_workshop_submissions_submitted_by 
  ON workshop_submissions(submitted_by);

CREATE INDEX IF NOT EXISTS idx_workshop_submissions_workshop_id 
  ON workshop_submissions(workshop_id);

CREATE INDEX IF NOT EXISTS idx_workshops_creator_id 
  ON workshops(creator_id);

-- =====================================================
-- Writing Goal Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_writing_goals_user_id 
  ON writing_goals(user_id);

-- =====================================================
-- Zine Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_zine_poems_poem_id 
  ON zine_poems(poem_id);

CREATE INDEX IF NOT EXISTS idx_zines_creator_id 
  ON zines(creator_id);