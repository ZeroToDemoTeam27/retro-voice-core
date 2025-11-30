import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Bot, Server, Database, Settings, LogOut, Home, User } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/assistants', label: 'Assistants', icon: Bot },
    { path: '/admin/mcp-servers', label: 'MCP Servers', icon: Server },
    { path: '/admin/knowledge-base', label: 'Knowledge Base', icon: Database },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header */}
      <header className="h-16 border-b-2 border-primary bg-card flex items-center justify-between px-6 shadow-lg">
        <Link to="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-amber-glow">
            <span className="text-primary-foreground font-bold text-xl font-retro">R</span>
          </div>
          <div>
            <div className="text-xl font-retro text-foreground">RUMMI Admin</div>
            <div className="text-xs font-retro text-muted-foreground">Control Center</div>
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="outline" size="sm" className="font-retro">
              <Home className="h-4 w-4 mr-2" />
              Main App
            </Button>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 border border-border rounded-lg bg-muted/30">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground font-retro">
                {user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user?.email?.split('@')[0]}</div>
                <div className="text-xs text-muted-foreground">Dashboard User</div>
              </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="font-retro">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex w-full">
        {/* Sidebar */}
        <aside className="w-72 min-h-[calc(100vh-4rem)] border-r-2 border-primary/20 bg-gradient-to-b from-card to-muted/20">
          <nav className="p-6 space-y-3">
            <div className="text-xs font-retro text-muted-foreground uppercase tracking-wider mb-4 px-2">
              Navigation
            </div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 rounded-lg transition-all font-retro group relative overflow-hidden',
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground shadow-amber-glow'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:border-primary/50 border border-transparent'
                )}
              >
                <div className={cn(
                  "p-2 rounded-md transition-all",
                  isActive(item.path) 
                    ? "bg-primary-foreground/20" 
                    : "bg-muted group-hover:bg-primary/20"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
                {isActive(item.path) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground" />
                )}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gradient-to-br from-background via-background to-muted/10 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
