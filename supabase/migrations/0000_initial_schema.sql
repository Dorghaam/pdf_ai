-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table for user documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Assuming Supabase Auth
    file_name TEXT NOT NULL,
    blob_url TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending_processing', -- e.g., pending_processing, processing, processed, failed
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create a table for document chunks and their embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI 'text-embedding-3-small' outputs 1536 dimensions
    page_number INTEGER,
    metadata JSONB, -- For any other metadata
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create an index on the embedding column for faster similarity search
-- Using HNSW index for cosine similarity (vector_cosine_ops)
-- Adjust ef_search and m parameters based on your dataset and performance needs
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);


-- Create a function for similarity search (example)
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding VECTOR(1536),
  filter_document_id UUID,
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  page_number INTEGER,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.page_number,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity -- Cosine similarity
  FROM
    document_chunks dc
  WHERE dc.document_id = filter_document_id AND (1 - (dc.embedding <=> query_embedding)) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
$;


-- RLS Policies (Row Level Security)
-- Make sure to enable RLS for your tables in Supabase UI or via SQL.

-- For 'documents' table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
ON documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
ON documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON documents FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
ON documents FOR DELETE
USING (auth.uid() = user_id);


-- For 'document_chunks' table
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Option 1: Users can access chunks related to documents they own
CREATE POLICY "Users can access chunks for their own documents"
ON document_chunks FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM documents d
    WHERE d.id = document_chunks.document_id AND d.user_id = auth.uid()
  )
);

-- Function to get current user ID (if not using auth.uid() directly in policies)
CREATE OR REPLACE FUNCTION get_my_user_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $
  SELECT auth.uid();
$;