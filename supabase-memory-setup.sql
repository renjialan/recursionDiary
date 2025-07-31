-- Memory System Setup for Success Diary
-- This file sets up the necessary tables and functions for the memory/RAG system

-- Enable the pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    context TEXT DEFAULT 'diary_entry',
    tags TEXT[] DEFAULT '{}',
    embedding vector(1536), -- OpenAI ada-002 embedding dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS memories_embedding_idx ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index for user_id for faster filtering
CREATE INDEX IF NOT EXISTS memories_user_id_idx ON memories(user_id);

-- Create index for created_at for chronological queries
CREATE INDEX IF NOT EXISTS memories_created_at_idx ON memories(created_at DESC);

-- Create index for tags for tag-based searches
CREATE INDEX IF NOT EXISTS memories_tags_idx ON memories USING GIN(tags);

-- Function to match memories by vector similarity
CREATE OR REPLACE FUNCTION match_memories(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5,
    user_id text DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id TEXT,
    content TEXT,
    context TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.user_id,
        m.content,
        m.context,
        m.tags,
        m.created_at,
        m.metadata,
        1 - (m.embedding <=> query_embedding) as similarity
    FROM memories m
    WHERE 
        (user_id IS NULL OR m.user_id = user_id)
        AND m.embedding IS NOT NULL
        AND 1 - (m.embedding <=> query_embedding) > match_threshold
    ORDER BY m.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to search memories by text (fallback when embeddings are not available)
CREATE OR REPLACE FUNCTION search_memories_text(
    search_query TEXT,
    user_id text DEFAULT NULL,
    limit_count int DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    user_id TEXT,
    content TEXT,
    context TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    relevance_score float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.user_id,
        m.content,
        m.context,
        m.tags,
        m.created_at,
        m.metadata,
        CASE 
            WHEN m.content ILIKE '%' || search_query || '%' THEN 0.8
            WHEN EXISTS (SELECT 1 FROM unnest(m.tags) tag WHERE tag ILIKE '%' || search_query || '%') THEN 0.6
            ELSE 0.3
        END as relevance_score
    FROM memories m
    WHERE 
        (user_id IS NULL OR m.user_id = user_id)
        AND (
            m.content ILIKE '%' || search_query || '%'
            OR EXISTS (SELECT 1 FROM unnest(m.tags) tag WHERE tag ILIKE '%' || search_query || '%')
        )
    ORDER BY relevance_score DESC, m.created_at DESC
    LIMIT limit_count;
END;
$$;

-- Function to get memory statistics for a user
CREATE OR REPLACE FUNCTION get_memory_stats(user_id text)
RETURNS TABLE (
    total_memories bigint,
    recent_memories bigint,
    top_tags text[],
    memory_trend text
)
LANGUAGE plpgsql
AS $$
DECLARE
    total_count bigint;
    recent_count bigint;
    tag_array text[];
    trend text;
BEGIN
    -- Get total memories
    SELECT COUNT(*) INTO total_count FROM memories WHERE memories.user_id = get_memory_stats.user_id;
    
    -- Get recent memories (last 30 days)
    SELECT COUNT(*) INTO recent_count 
    FROM memories 
    WHERE memories.user_id = get_memory_stats.user_id 
    AND created_at > NOW() - INTERVAL '30 days';
    
    -- Get top tags
    SELECT ARRAY_AGG(tag ORDER BY tag_count DESC LIMIT 10) INTO tag_array
    FROM (
        SELECT unnest(tags) as tag, COUNT(*) as tag_count
        FROM memories 
        WHERE user_id = get_memory_stats.user_id
        GROUP BY tag
        ORDER BY tag_count DESC
        LIMIT 10
    ) tag_counts;
    
    -- Determine trend
    IF recent_count > total_count * 0.3 THEN
        trend := 'increasing';
    ELSIF recent_count < total_count * 0.1 THEN
        trend := 'decreasing';
    ELSE
        trend := 'stable';
    END IF;
    
    RETURN QUERY SELECT total_count, recent_count, tag_array, trend;
END;
$$;

-- Function to clean up old memories (optional maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_memories(
    days_to_keep int DEFAULT 365,
    user_id text DEFAULT NULL
)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count int;
BEGIN
    DELETE FROM memories 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep
    AND (user_id IS NULL OR memories.user_id = cleanup_old_memories.user_id);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Insert some sample data for testing (optional)
-- INSERT INTO memories (user_id, content, context, tags, metadata) VALUES
-- ('test-user-1', 'I had a great workout today and felt really energized. I want to make this a regular habit.', 'diary_entry', ARRAY['fitness', 'goals', 'health'], '{"wordCount": 20, "categories": ["goals", "achievements"], "hasGoals": true, "hasAchievements": true}'),
-- ('test-user-1', 'Struggling with work-life balance lately. Need to set better boundaries.', 'diary_entry', ARRAY['work', 'challenges', 'stress'], '{"wordCount": 15, "categories": ["challenges"], "hasChallenges": true}'),
-- ('test-user-1', 'Made progress on my coding project today. Learning new technologies is exciting!', 'diary_entry', ARRAY['learning', 'creativity', 'achievements'], '{"wordCount": 18, "categories": ["learning", "achievements"], "hasAchievements": true}');

-- Grant necessary permissions (adjust based on your Supabase setup)
-- GRANT USAGE ON SCHEMA public TO anon, authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 