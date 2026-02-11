/*
  # Add Missing Foreign Key Indexes

  Add covering indexes for all unindexed foreign keys to improve join performance and query optimization.
*/

-- AI Conversations & Messages
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_id ON ai_messages(user_id);

-- Anthologies
CREATE INDEX IF NOT EXISTS idx_anthologies_curator_id ON anthologies(curator_id);
CREATE INDEX IF NOT EXISTS idx_anthology_submissions_poem_id ON anthology_submissions(poem_id);

-- Bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_poem_id ON bookmarks(poem_id);

-- Challenges
CREATE INDEX IF NOT EXISTS idx_challenge_participations_poem_id ON challenge_participations(poem_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user_id ON challenge_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON challenges(created_by);

-- Collaboration
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_collaborative_poem_id ON collaboration_invitations(collaborative_poem_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_invitee_id ON collaboration_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_inviter_id ON collaboration_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_poems_creator_id ON collaborative_poems(creator_id);

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Community Submissions
CREATE INDEX IF NOT EXISTS idx_community_submissions_reviewed_by ON community_submissions(reviewed_by);

-- Contests
CREATE INDEX IF NOT EXISTS idx_contest_entries_poem_id ON contest_entries(poem_id);
CREATE INDEX IF NOT EXISTS idx_contest_entries_user_id ON contest_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_votes_entry_id ON contest_votes(entry_id);
CREATE INDEX IF NOT EXISTS idx_contest_votes_user_id ON contest_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_contests_created_by ON contests(created_by);
CREATE INDEX IF NOT EXISTS idx_contests_participant_badge_id ON contests(participant_badge_id);
CREATE INDEX IF NOT EXISTS idx_contests_runner_up_badge_id ON contests(runner_up_badge_id);
CREATE INDEX IF NOT EXISTS idx_contests_winner_badge_id ON contests(winner_badge_id);

-- Critiques
CREATE INDEX IF NOT EXISTS idx_critiques_user_id ON critiques(user_id);
CREATE INDEX IF NOT EXISTS idx_critiques_workshop_submission_id ON critiques(workshop_submission_id);

-- Daily Prompts
CREATE INDEX IF NOT EXISTS idx_daily_prompts_created_by ON daily_prompts(created_by);

-- Events
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_events_host_id ON events(host_id);

-- External API
CREATE INDEX IF NOT EXISTS idx_external_api_keys_created_by ON external_api_keys(created_by);
CREATE INDEX IF NOT EXISTS idx_external_api_usage_api_key_id ON external_api_usage(api_key_id);

-- Feedback
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- Mentorships
CREATE INDEX IF NOT EXISTS idx_mentorships_mentee_id ON mentorships(mentee_id);

-- PaaS System
CREATE INDEX IF NOT EXISTS idx_paas_access_codes_created_by ON paas_access_codes(created_by);
CREATE INDEX IF NOT EXISTS idx_paas_access_codes_used_by ON paas_access_codes(used_by);
CREATE INDEX IF NOT EXISTS idx_paas_ai_banker_decisions_billing_period_id ON paas_ai_banker_decisions(billing_period_id);
CREATE INDEX IF NOT EXISTS idx_paas_ai_banker_decisions_developer_id ON paas_ai_banker_decisions(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_api_logs_api_key_id ON paas_api_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_paas_api_logs_developer_id ON paas_api_logs(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_api_usage_api_key_id ON paas_api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_paas_api_usage_developer_id ON paas_api_usage(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_billing_charges_billing_period_id ON paas_billing_charges(billing_period_id);
CREATE INDEX IF NOT EXISTS idx_paas_billing_charges_developer_id ON paas_billing_charges(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_billing_periods_developer_id ON paas_billing_periods(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_developer_reserves_category_id ON paas_developer_reserves(category_id);
CREATE INDEX IF NOT EXISTS idx_paas_developers_access_code_id ON paas_developers(access_code_id);
CREATE INDEX IF NOT EXISTS idx_paas_point_grants_developer_id ON paas_point_grants(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_reserve_ai_recommendations_developer_id ON paas_reserve_ai_recommendations(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_reserve_allocations_developer_id ON paas_reserve_allocations(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_reserve_allocations_reserve_id ON paas_reserve_allocations(reserve_id);
CREATE INDEX IF NOT EXISTS idx_paas_reserve_transactions_developer_id ON paas_reserve_transactions(developer_id);
CREATE INDEX IF NOT EXISTS idx_paas_reserve_transactions_reserve_id ON paas_reserve_transactions(reserve_id);
CREATE INDEX IF NOT EXISTS idx_paas_security_events_api_key_id ON paas_security_events(api_key_id);
CREATE INDEX IF NOT EXISTS idx_paas_security_events_manual_override_by ON paas_security_events(manual_override_by);
CREATE INDEX IF NOT EXISTS idx_paas_transactions_api_key_id ON paas_transactions(api_key_id);

-- Poems
CREATE INDEX IF NOT EXISTS idx_poem_collaborators_collaborative_poem_id ON poem_collaborators(collaborative_poem_id);
CREATE INDEX IF NOT EXISTS idx_poem_collaborators_user_id ON poem_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_poem_collections_collection_id ON poem_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_poem_tags_tag_id ON poem_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_poem_versions_poem_id ON poem_versions(poem_id);

-- Prompts
CREATE INDEX IF NOT EXISTS idx_prompt_responses_poem_id ON prompt_responses(poem_id);
CREATE INDEX IF NOT EXISTS idx_prompt_responses_user_id ON prompt_responses(user_id);

-- Reading Lists
CREATE INDEX IF NOT EXISTS idx_reading_list_items_poem_id ON reading_list_items(poem_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_items_reading_list_id ON reading_list_items(reading_list_id);
CREATE INDEX IF NOT EXISTS idx_reading_lists_user_id ON reading_lists(user_id);

-- Study Groups
CREATE INDEX IF NOT EXISTS idx_study_group_resources_user_id ON study_group_resources(user_id);

-- User System
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_item_id ON user_purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_user_tax_transactions_user_id ON user_tax_transactions(user_id);

-- Workshops
CREATE INDEX IF NOT EXISTS idx_workshop_members_user_id ON workshop_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_poem_id ON workshop_submissions(poem_id);
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_submitted_by ON workshop_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_workshop_id ON workshop_submissions(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshops_creator_id ON workshops(creator_id);

-- Writing Goals
CREATE INDEX IF NOT EXISTS idx_writing_goals_user_id ON writing_goals(user_id);

-- Zines
CREATE INDEX IF NOT EXISTS idx_zine_poems_poem_id ON zine_poems(poem_id);
CREATE INDEX IF NOT EXISTS idx_zines_creator_id ON zines(creator_id);