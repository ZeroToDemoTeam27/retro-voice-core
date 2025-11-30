import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Server, Database, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [assistants, mcpServers, files] = await Promise.all([
        supabase.from('assistants').select('id, status', { count: 'exact' }),
        supabase.from('mcp_servers').select('id', { count: 'exact' }),
        supabase.from('knowledge_base').select('id', { count: 'exact' }),
      ]);

      const activeAssistants = assistants.data?.filter(a => a.status === 'active').length || 0;

      return {
        totalAssistants: assistants.count || 0,
        activeAssistants,
        totalMcpServers: mcpServers.count || 0,
        totalFiles: files.count || 0,
      };
    },
  });

  const statCards = [
    {
      title: 'Total Assistants',
      value: stats?.totalAssistants || 0,
      icon: Bot,
      description: `${stats?.activeAssistants || 0} active`,
    },
    {
      title: 'MCP Servers',
      value: stats?.totalMcpServers || 0,
      icon: Server,
      description: 'Connected servers',
    },
    {
      title: 'Knowledge Base Files',
      value: stats?.totalFiles || 0,
      icon: Database,
      description: 'Total uploaded files',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-retro text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your RUMMI admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
