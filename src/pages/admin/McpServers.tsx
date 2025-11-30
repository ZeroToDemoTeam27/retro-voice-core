import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Server } from 'lucide-react';
import { toast } from 'sonner';
import { McpServerDialog } from '@/components/admin/McpServerDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function McpServers() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<any>(null);

  const { data: servers, isLoading } = useQuery({
    queryKey: ['mcp-servers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mcp_servers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mcp_servers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] });
      toast.success('MCP server deleted');
    },
    onError: () => {
      toast.error('Failed to delete MCP server');
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-retro text-foreground mb-2 retro-glow">MCP Servers</h1>
          <p className="text-muted-foreground font-retro">Connect and manage Model Context Protocol servers</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="font-retro shadow-lg hover:shadow-amber-glow transition-all">
          <Plus className="h-4 w-4 mr-2" />
          Add MCP Server
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground font-retro">
          <div className="animate-pulse">Loading...</div>
        </div>
      ) : servers?.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-primary/30 rounded-2xl bg-muted/20">
          <Server className="h-16 w-16 mx-auto mb-4 text-primary/50" />
          <p className="text-lg font-retro text-muted-foreground mb-4">No MCP servers configured</p>
          <Button onClick={() => setDialogOpen(true)} className="font-retro">
            <Plus className="h-4 w-4 mr-2" />
            Add your first server
          </Button>
        </div>
      ) : (
        <div className="border-2 border-primary/20 rounded-xl bg-card shadow-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers?.map((server) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium">{server.name}</TableCell>
                  <TableCell className="font-mono text-sm">{server.server_url}</TableCell>
                  <TableCell>
                    <Badge variant={server.status === 'connected' ? 'default' : 'secondary'}>
                      {server.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(server.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingServer(server);
                          setDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(server.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <McpServerDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingServer(null);
        }}
        server={editingServer}
      />
    </div>
  );
}
