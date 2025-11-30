-- Update RLS policies to allow all authenticated users (not just admins)

-- Assistants table - allow all authenticated users
DROP POLICY IF EXISTS "Admins can view all assistants" ON public.assistants;
DROP POLICY IF EXISTS "Admins can insert assistants" ON public.assistants;
DROP POLICY IF EXISTS "Admins can update assistants" ON public.assistants;
DROP POLICY IF EXISTS "Admins can delete assistants" ON public.assistants;

CREATE POLICY "Authenticated users can view assistants"
  ON public.assistants
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert assistants"
  ON public.assistants
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update assistants"
  ON public.assistants
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete assistants"
  ON public.assistants
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Assistant files - allow all authenticated users
DROP POLICY IF EXISTS "Admins can manage assistant files" ON public.assistant_files;

CREATE POLICY "Authenticated users can manage assistant files"
  ON public.assistant_files
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- MCP servers - allow all authenticated users
DROP POLICY IF EXISTS "Admins can manage mcp_servers" ON public.mcp_servers;

CREATE POLICY "Authenticated users can manage mcp_servers"
  ON public.mcp_servers
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Assistant MCP servers - allow all authenticated users
DROP POLICY IF EXISTS "Admins can manage assistant mcp servers" ON public.assistant_mcp_servers;

CREATE POLICY "Authenticated users can manage assistant mcp servers"
  ON public.assistant_mcp_servers
  FOR ALL
  USING (auth.uid() IS NOT NULL);