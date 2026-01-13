import { supabase } from '../lib/supabase';

// Cache for frequently accessed data with TTL
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(...args: any[]): string {
  return JSON.stringify(args);
}

function setCache(key: string, data: any): void {
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

function getCache(key: string): any | null {
  const cached = queryCache.get(key);
  if (!cached) return null;

  // Check if cache has expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    queryCache.delete(key);
    return null;
  }

  return cached.data;
}

export function clearCache(): void {
  queryCache.clear();
}

// Optimized query to get public poems with counts
export async function getPublicPoemsWithCounts(
  limit: number = 20,
  offset: number = 0,
  useCache: boolean = true
) {
  const cacheKey = getCacheKey('public-poems', limit, offset);
  
  if (useCache) {
    const cached = getCache(cacheKey);
    if (cached) return cached;
  }

  try {
    // Get poems with user info (minimal fields for speed)
    const { data: poems, error } = await supabase
      .from('poems')
      .select(
        `
        id,
        title,
        content,
        user_id,
        created_at,
        user_profiles(username, display_name)
        `
      )
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get counts for each poem in a single batch query
    const poemIds = poems?.map(p => p.id) || [];
    let countsMap = new Map<string, { likes: number; comments: number }>();

    if (poemIds.length > 0) {
      // Get reaction counts
      const { data: reactions } = await supabase
        .from('reactions')
        .select('poem_id')
        .in('poem_id', poemIds)
        .eq('reaction_type', 'like');

      // Get comment counts
      const { data: comments } = await supabase
        .from('comments')
        .select('poem_id');

      // Build map of counts
      for (const poemId of poemIds) {
        countsMap.set(poemId, {
          likes: reactions?.filter(r => r.poem_id === poemId).length || 0,
          comments: comments?.filter(c => c.poem_id === poemId).length || 0,
        });
      }
    }

    // Merge counts with poems
    const enrichedPoems = (poems || []).map(poem => ({
      ...poem,
      reactions_count: countsMap.get(poem.id)?.likes || 0,
      comments_count: countsMap.get(poem.id)?.comments || 0,
    }));

    if (useCache) {
      setCache(cacheKey, enrichedPoems);
    }

    return enrichedPoems;
  } catch (error) {
    console.debug('Failed to fetch public poems');
    return [];
  }
}

// Optimized query to get user's poems
export async function getUserPoems(userId: string | undefined) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('poems')
      .select('id, title, content, is_public, word_count, created_at, updated_at, favorited')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.debug('Failed to fetch user poems');
    return [];
  }
}

// Optimized query to get user's submissions
export async function getUserSubmissions(userId: string | undefined) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('submissions')
      .select(
        `
        id,
        venue_name,
        venue_type,
        submission_date,
        response_date,
        status,
        notes,
        poems(title)
        `
      )
      .eq('user_id', userId)
      .order('submission_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.debug('Failed to fetch user submissions');
    return [];
  }
}

// Batch load comments with user info
export async function getCommentsWithUsers(poemId: string) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        id,
        content,
        user_id,
        created_at,
        updated_at,
        user_profiles(username, display_name)
        `
      )
      .eq('poem_id', poemId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.debug('Failed to fetch comments');
    return [];
  }
}

// Batch load reaction counts
export async function getReactionCounts(poemId: string) {
  try {
    const { data: likes, error: likesError } = await supabase
      .from('reactions')
      .select('id', { count: 'exact' })
      .eq('poem_id', poemId)
      .eq('reaction_type', 'like');

    if (likesError) throw likesError;

    return {
      likes: likes?.length || 0,
    };
  } catch (error) {
    console.debug('Failed to fetch reaction counts');
    return { likes: 0 };
  }
}

// Check if user liked a poem
export async function hasUserLikedPoem(poemId: string, userId: string | undefined) {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('reactions')
      .select('id')
      .eq('poem_id', poemId)
      .eq('user_id', userId)
      .eq('reaction_type', 'like')
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.debug('Failed to check user like status');
    return false;
  }
}
