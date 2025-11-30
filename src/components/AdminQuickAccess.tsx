import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LayoutDashboard, Bot, Server, Database, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export const AdminQuickAccess = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const quickLinks = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/assistants', label: 'Assistants', icon: Bot },
    { path: '/admin/mcp-servers', label: 'MCP Servers', icon: Server },
    { path: '/admin/knowledge-base', label: 'Knowledge', icon: Database },
  ];

  return (
    <div className="fixed bottom-4 left-4 z-30">
      {/* Quick Links Menu */}
      {isOpen && (
        <div className="mb-4 space-y-2 animate-fade-in">
          {quickLinks.map((link) => (
            <Button
              key={link.path}
              variant="outline"
              size="sm"
              onClick={() => {
                navigate(link.path);
                setIsOpen(false);
              }}
              className="w-full justify-start font-retro bg-card border-2 border-primary/30 hover:bg-primary/10 hover:border-primary shadow-lg"
            >
              <link.icon className="h-4 w-4 mr-2" />
              {link.label}
            </Button>
          ))}
        </div>
      )}

      {/* Toggle Button */}
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-amber-glow font-retro transition-all duration-300",
          isOpen ? "bg-secondary" : "bg-primary"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Settings className="h-6 w-6 animate-spin-slow" />
        )}
      </Button>
    </div>
  );
};
