/*
  # Remove Unused Index on poem_collections

  ## Overview
  This migration removes an unused index that is consuming resources without providing
  any performance benefit.

  ## Changes Made

  ### Remove Unused Index
  - `idx_poem_collections_collection_id` on `poem_collections.collection_id`
  
  **Reason for Removal:**
  - The index has not been used by any queries
  - The composite primary key (poem_id, collection_id) already provides sufficient indexing
  - Queries in the application primarily filter by poem_id, not collection_id
  - Removing it reduces storage overhead and write performance costs
  
  ## Performance Impact
  - Reduces index maintenance overhead on INSERT/UPDATE/DELETE operations
  - Frees up storage space
  - No negative impact as the index is not being used by any queries
  
  ## Important Notes
  - The composite primary key will continue to support queries efficiently
  - If collection_id queries become common in the future, the index can be recreated
  - This change is safe and reversible
*/

-- Remove the unused index on poem_collections.collection_id
DROP INDEX IF EXISTS idx_poem_collections_collection_id;