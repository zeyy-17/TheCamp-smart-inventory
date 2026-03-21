import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Mail, User } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const Login = () => {
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'email' | 'username'>('email');
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let email = loginValue;

    // If signing in with username, look up the email first
    if (loginMode === 'username') {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/lookup-username`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: loginValue }),
        });
        const data = await res.json();
        if (!res.ok || !data.email) {
          toast({
            title: "Login Failed",
            description: "Username not found",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        email = data.email;
      } catch {
        toast({
          title: "Login Failed",
          description: "Could not verify username",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <LogIn className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Inventory System</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Login mode toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={loginMode === 'email' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => { setLoginMode('email'); setLoginValue(''); }}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              type="button"
              variant={loginMode === 'username' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => { setLoginMode('username'); setLoginValue(''); }}
            >
              <User className="w-4 h-4 mr-2" />
              Username
            </Button>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-login">
                {loginMode === 'email' ? 'Email' : 'Username'}
              </Label>
              <Input
                id="signin-login"
                type={loginMode === 'email' ? 'email' : 'text'}
                placeholder={loginMode === 'email' ? 'Enter your email' : 'Enter your username'}
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
