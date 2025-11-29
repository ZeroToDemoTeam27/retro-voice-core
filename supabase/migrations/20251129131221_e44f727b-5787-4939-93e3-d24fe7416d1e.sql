-- Create knowledge_base table
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge_base table
CREATE POLICY "Users can view their own knowledge base files"
ON public.knowledge_base
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own knowledge base files"
ON public.knowledge_base
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge base files"
ON public.knowledge_base
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster user queries
CREATE INDEX knowledge_base_user_id_idx ON public.knowledge_base(user_id);

-- Create knowledge-base storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-base', 'knowledge-base', false);

-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own knowledge base files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'knowledge-base' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to view their own files
CREATE POLICY "Users can view their own knowledge base files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'knowledge-base' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own knowledge base files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'knowledge-base' AND
  auth.uid()::text = (storage.foldername(name))[1]
);