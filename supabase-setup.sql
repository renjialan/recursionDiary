-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}'
);

-- Create insights table
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('single', 'multi')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_history JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_document_id ON insights(document_id);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON insights(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these based on your auth requirements)
CREATE POLICY "Allow public read access to documents" ON documents
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to documents" ON documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to documents" ON documents
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to documents" ON documents
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access to insights" ON insights
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to insights" ON insights
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to insights" ON insights
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to insights" ON insights
  FOR DELETE USING (true); 