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
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent rounded-2xl blur-3xl" />
        <div className="relative bg-gradient-to-br from-card to-muted/30 border-2 border-primary/20 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary rounded-xl shadow-amber-glow">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-5xl font-retro text-foreground mb-2 retro-glow">Dashboard</h1>
              <p className="text-lg text-muted-foreground font-retro">
                System Overview & Analytics
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <div className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-lg text-sm font-retro text-primary">
              Status: Online
            </div>
            <div className="px-3 py-1 bg-muted border border-border rounded-lg text-sm font-retro text-muted-foreground">
              Last Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card 
            key={stat.title}
            className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-xl hover:scale-105 duration-300 bg-gradient-to-br from-card to-muted/20"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-retro text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground font-retro mb-2 retro-glow">
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground font-retro flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle className="font-retro text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/admin/assistants/new" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-primary/30 hover:bg-primary/10 transition-all cursor-pointer group">
                <Bot className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-retro text-sm font-medium group-hover:text-primary transition-colors">
                    Create New Assistant
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Set up a new AI voice assistant
                  </div>
                </div>
              </div>
            </a>
            <a href="/admin/mcp-servers" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-primary/30 hover:bg-primary/10 transition-all cursor-pointer group">
                <Server className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-retro text-sm font-medium group-hover:text-primary transition-colors">
                    Add MCP Server
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Connect external context servers
                  </div>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle className="font-retro text-xl">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-retro text-sm">Database</span>
              </div>
              <span className="text-xs text-muted-foreground font-retro">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-retro text-sm">Storage</span>
              </div>
              <span className="text-xs text-muted-foreground font-retro">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-retro text-sm">API Services</span>
              </div>
              <span className="text-xs text-muted-foreground font-retro">Operational</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
