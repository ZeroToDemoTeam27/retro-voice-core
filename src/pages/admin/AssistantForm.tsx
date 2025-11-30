import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  base_prompt: z.string().min(1, 'Base prompt is required').max(5000),
  status: z.enum(['active', 'inactive']),
  mcpServerIds: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

export default function AssistantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEdit = !!id;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      base_prompt: '',
      status: 'inactive',
      mcpServerIds: [],
    },
  });

  const { data: assistant } = useQuery({
    queryKey: ['assistant', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('assistants')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  const { data: mcpServers } = useQuery({
    queryKey: ['mcp-servers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mcp_servers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: linkedMcpServers } = useQuery({
    queryKey: ['assistant-mcp-servers', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('assistant_mcp_servers')
        .select('mcp_server_id')
        .eq('assistant_id', id);
      
      if (error) throw error;
      return data.map(d => d.mcp_server_id);
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (assistant) {
      form.reset({
        name: assistant.name,
        base_prompt: assistant.base_prompt,
        status: assistant.status as 'active' | 'inactive',
        mcpServerIds: linkedMcpServers || [],
      });
    }
  }, [assistant, linkedMcpServers, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEdit) {
        const { error } = await supabase
          .from('assistants')
          .update({
            name: data.name,
            base_prompt: data.base_prompt,
            status: data.status,
          })
          .eq('id', id);
        
        if (error) throw error;

        // Update MCP server links
        await supabase
          .from('assistant_mcp_servers')
          .delete()
          .eq('assistant_id', id);

        if (data.mcpServerIds.length > 0) {
          const { error: linkError } = await supabase
            .from('assistant_mcp_servers')
            .insert(
              data.mcpServerIds.map(mcpId => ({
                assistant_id: id,
                mcp_server_id: mcpId,
              }))
            );
          
          if (linkError) throw linkError;
        }
      } else {
        const { data: newAssistant, error } = await supabase
          .from('assistants')
          .insert({
            name: data.name,
            base_prompt: data.base_prompt,
            status: data.status,
            created_by: user?.id,
          })
          .select()
          .single();
        
        if (error) throw error;

        if (data.mcpServerIds.length > 0) {
          const { error: linkError } = await supabase
            .from('assistant_mcp_servers')
            .insert(
              data.mcpServerIds.map(mcpId => ({
                assistant_id: newAssistant.id,
                mcp_server_id: mcpId,
              }))
            );
          
          if (linkError) throw linkError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
      queryClient.invalidateQueries({ queryKey: ['assistant', id] });
      toast.success(isEdit ? 'Assistant updated' : 'Assistant created');
      navigate('/admin/assistants');
    },
    onError: () => {
      toast.error('Failed to save assistant');
    },
  });

  const onSubmit = (data: FormData) => {
    saveMutation.mutate(data);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-retro text-foreground mb-2">
          {isEdit ? 'Edit Assistant' : 'Create Assistant'}
        </h1>
        <p className="text-muted-foreground">
          {isEdit ? 'Update assistant configuration' : 'Create a new voice assistant'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Configure the assistant's identity and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer Support Bot" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this assistant
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="base_prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="You are a helpful customer support assistant..."
                        className="min-h-[200px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      System instructions that define the assistant's personality and behavior
                    </FormDescription>
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
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Enable or disable this assistant
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 'active'}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 'active' : 'inactive')
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {mcpServers && mcpServers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>MCP Servers</CardTitle>
                <CardDescription>Connect external Model Context Protocol servers</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="mcpServerIds"
                  render={() => (
                    <FormItem>
                      <div className="space-y-3">
                        {mcpServers.map((server) => (
                          <FormField
                            key={server.id}
                            control={form.control}
                            name="mcpServerIds"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(server.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, server.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== server.id)
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-medium">
                                    {server.name}
                                  </FormLabel>
                                  {server.description && (
                                    <FormDescription>{server.description}</FormDescription>
                                  )}
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/assistants')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
