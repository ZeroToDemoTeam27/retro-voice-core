import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Assistants() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: assistants, isLoading } = useQuery({
    queryKey: ['assistants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assistants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assistants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
      toast.success('Assistant deleted successfully');
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Failed to delete assistant');
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-retro text-foreground mb-2 retro-glow">Assistants</h1>
          <p className="text-muted-foreground font-retro">Configure and manage AI voice assistants</p>
        </div>
        <Link to="/admin/assistants/new">
          <Button className="font-retro shadow-lg hover:shadow-amber-glow transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Create Assistant
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground font-retro">
          <div className="animate-pulse">Loading...</div>
        </div>
      ) : assistants?.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-primary/30 rounded-2xl bg-muted/20">
          <Bot className="h-16 w-16 mx-auto mb-4 text-primary/50" />
          <p className="text-lg font-retro text-muted-foreground mb-4">No assistants yet</p>
          <Link to="/admin/assistants/new">
            <Button className="font-retro">
              <Plus className="h-4 w-4 mr-2" />
              Create your first assistant
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border-2 border-primary/20 rounded-xl bg-card shadow-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assistants?.map((assistant) => (
                <TableRow key={assistant.id}>
                  <TableCell className="font-medium">{assistant.name}</TableCell>
                  <TableCell>
                    <Badge variant={assistant.status === 'active' ? 'default' : 'secondary'}>
                      {assistant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(assistant.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/assistants/${assistant.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/admin/assistants/${assistant.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(assistant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assistant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assistant? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
