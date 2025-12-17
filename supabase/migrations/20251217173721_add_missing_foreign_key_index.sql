/*
  # Add Missing Foreign Key Index

  1. Performance Optimization
    - Add index on `poem_collections.collection_id` foreign key
    - This index improves query performance for lookups by collection
    - Prevents table scans when joining or filtering by collection_id

  2. Technical Details
    - Index name follows PostgreSQL naming convention
    - Uses B-tree index (default) which is optimal for foreign key lookups
    - Index creation uses IF NOT EXISTS to ensure idempotency
*/

-- Add index on collection_id foreign key in poem_collections table
CREATE INDEX IF NOT EXISTS idx_poem_collections_collection_id 
  ON poem_collections(collection_id);
