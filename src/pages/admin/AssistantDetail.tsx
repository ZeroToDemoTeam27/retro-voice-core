import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, ArrowLeft } from 'lucide-react';
import { AssistantFiles } from '@/components/admin/AssistantFiles';

export default function AssistantDetail() {
  const { id } = useParams();

  const { data: assistant, isLoading } = useQuery({
    queryKey: ['assistant', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      const { data, error } = await supabase
        .from('assistants')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: mcpServers } = useQuery({
    queryKey: ['assistant-mcp-servers-detail', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('assistant_mcp_servers')
        .select('mcp_server_id, mcp_servers(*)')
        .eq('assistant_id', id);
      
      if (error) throw error;
      return data.map(d => d.mcp_servers).filter(Boolean);
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!assistant) {
    return <div className="text-center py-12">Assistant not found</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/assistants">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-4xl font-retro text-foreground mb-2">{assistant.name}</h1>
          <p className="text-muted-foreground">Assistant details and configuration</p>
        </div>
        <Link to={`/admin/assistants/${id}/edit`}>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
              <Badge variant={assistant.status === 'active' ? 'default' : 'secondary'}>
                {assistant.status}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Created</div>
              <div className="text-foreground">
                {new Date(assistant.created_at).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
              {assistant.base_prompt}
            </pre>
          </CardContent>
        </Card>

        {mcpServers && mcpServers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Connected MCP Servers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mcpServers.map((server: any) => (
                  <div
                    key={server.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{server.name}</div>
                      {server.description && (
                        <div className="text-sm text-muted-foreground">{server.description}</div>
                      )}
                    </div>
                    <Badge variant={server.status === 'connected' ? 'default' : 'secondary'}>
                      {server.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <AssistantFiles assistantId={id!} />
      </div>
    </div>
  );
}
