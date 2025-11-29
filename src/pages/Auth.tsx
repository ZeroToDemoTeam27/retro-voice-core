import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  username: z.string().trim().min(2, { message: 'Username must be at least 2 characters' }).optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData: AuthFormData = {
        email,
        password,
        ...(isSignUp && username ? { username } : {}),
      };

      const validation = authSchema.safeParse(formData);
      
      if (!validation.success) {
        const errors = validation.error.errors.map(e => e.message).join(', ');
        toast({
          title: 'Validation Error',
          description: errors,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (isSignUp) {
        // Check if username already exists
        if (username) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username.trim())
            .single();

          if (existingProfile) {
            toast({
              title: 'Error',
              description: 'Username already taken. Please choose another one.',
              variant: 'destructive',
            });
            setLoading(false);
            return;
          }
        }

        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username: username || email.split('@')[0],
            },
          },
        });

        if (error) throw error;

        toast({
          title: 'Success!',
          description: 'Account created successfully. Please check your email to confirm.',
        });
        setIsSignUp(false);
      } else {
        // Check if login is with email or username
        let loginEmail = email;
        
        // If input doesn't contain @, treat it as username
        if (!email.includes('@')) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', email.trim())
            .single();

          if (!profile?.email) {
            toast({
              title: 'Error',
              description: 'Username not found',
              variant: 'destructive',
            });
            setLoading(false);
            return;
          }
          
          loginEmail = profile.email;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

        if (error) throw error;

        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during authentication',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-retro text-primary retro-glow">
            RUMMI
          </CardTitle>
          <CardDescription className="text-lg font-retro">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username" className="font-retro text-primary">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="cooluser"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-primary"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="font-retro text-primary">
                {isSignUp ? 'Email' : 'Email or Username'}
              </Label>
              <Input
                id="email"
                type={isSignUp ? "email" : "text"}
                placeholder={isSignUp ? "you@example.com" : "email or username"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-retro text-primary">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-primary opacity-50"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
