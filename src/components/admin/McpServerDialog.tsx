import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  server_url: z.string().url('Must be a valid URL'),
  description: z.string().max(500).optional(),
  auth_token: z.string().max(500).optional(),
  status: z.enum(['connected', 'disconnected']),
});

type FormData = z.infer<typeof formSchema>;

interface McpServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server?: any;
}

export const McpServerDialog = ({ open, onOpenChange, server }: McpServerDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = !!server;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      server_url: '',
      description: '',
      auth_token: '',
      status: 'disconnected',
    },
  });

  useEffect(() => {
    if (server) {
      form.reset({
        name: server.name,
        server_url: server.server_url,
        description: server.description || '',
        auth_token: server.auth_token || '',
        status: server.status,
      });
    } else {
      form.reset({
        name: '',
        server_url: '',
        description: '',
        auth_token: '',
        status: 'disconnected',
      });
    }
  }, [server, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEdit) {
        const { error } = await supabase
          .from('mcp_servers')
          .update(data)
          .eq('id', server.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mcp_servers')
          .insert([{
            name: data.name,
            server_url: data.server_url,
            description: data.description,
            auth_token: data.auth_token,
            status: data.status,
            created_by: user?.id,
          }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] });
      toast.success(isEdit ? 'MCP server updated' : 'MCP server created');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to save MCP server');
    },
  });

  const onSubmit = (data: FormData) => {
    saveMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit MCP Server' : 'Add MCP Server'}</DialogTitle>
          <DialogDescription>
            Configure a Model Context Protocol server connection
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My MCP Server" {...field} />
                  </FormControl>
                  <FormDescription>A friendly name to identify this server</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="server_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.example.com/mcp" {...field} />
                  </FormControl>
                  <FormDescription>The endpoint URL for the MCP server</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description of what this server provides..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="auth_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authentication Token (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="API key or authentication token"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional authentication credentials</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Connection Status</FormLabel>
                    <FormDescription>Mark this server as connected or disconnected</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 'connected'}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 'connected' : 'disconnected')
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
