-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create assistants table
CREATE TABLE public.assistants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS on assistants
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;

-- RLS policies for assistants
CREATE POLICY "Admins can view all assistants"
  ON public.assistants
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert assistants"
  ON public.assistants
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update assistants"
  ON public.assistants
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete assistants"
  ON public.assistants
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create assistant_files junction table
CREATE TABLE public.assistant_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id UUID REFERENCES public.assistants(id) ON DELETE CASCADE NOT NULL,
  knowledge_base_id UUID REFERENCES public.knowledge_base(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (assistant_id, knowledge_base_id)
);

-- Enable RLS on assistant_files
ALTER TABLE public.assistant_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for assistant_files
CREATE POLICY "Admins can manage assistant files"
  ON public.assistant_files
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create mcp_servers table
CREATE TABLE public.mcp_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  server_url TEXT NOT NULL,
  description TEXT,
  auth_token TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS on mcp_servers
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;

-- RLS policies for mcp_servers
CREATE POLICY "Admins can manage mcp_servers"
  ON public.mcp_servers
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create assistant_mcp_servers junction table
CREATE TABLE public.assistant_mcp_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id UUID REFERENCES public.assistants(id) ON DELETE CASCADE NOT NULL,
  mcp_server_id UUID REFERENCES public.mcp_servers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (assistant_id, mcp_server_id)
);

-- Enable RLS on assistant_mcp_servers
ALTER TABLE public.assistant_mcp_servers ENABLE ROW LEVEL SECURITY;

-- RLS policies for assistant_mcp_servers
CREATE POLICY "Admins can manage assistant mcp servers"
  ON public.assistant_mcp_servers
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on assistants
CREATE TRIGGER update_assistants_updated_at
  BEFORE UPDATE ON public.assistants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for updated_at on mcp_servers
CREATE TRIGGER update_mcp_servers_updated_at
  BEFORE UPDATE ON public.mcp_servers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();