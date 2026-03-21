import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, LogOut, User } from 'lucide-react';

const Account = () => {
  const { user, signOut, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernamePassword, setUsernamePassword] = useState('');
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.user_metadata?.username) {
      setUsername(user.user_metadata.username);
    }
  }, [user]);

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({ title: "Username Required", description: "Please enter a username", variant: "destructive" });
      return;
    }
    if (!usernamePassword) {
      toast({ title: "Password Required", description: "Please enter your password to confirm the change", variant: "destructive" });
      return;
    }
    setIsSavingUsername(true);

    // Verify password first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: usernamePassword,
    });
    if (signInError) {
      setIsSavingUsername(false);
      toast({ title: "Invalid Password", description: "The password you entered is incorrect", variant: "destructive" });
      return;
    }

    const { error } = await supabase.auth.updateUser({ data: { username: username.trim() } });
    setIsSavingUsername(false);
    setUsernamePassword('');
    if (error) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Username Updated", description: "Your username has been saved" });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    toast({ title: "Logged Out", description: "You have been logged out successfully" });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast({ title: "Current Password Required", description: "Please enter your current password", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Invalid Password", description: "Password must be at least 8 characters long", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords Don't Match", description: "Please make sure both passwords are the same", variant: "destructive" });
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword,
    });
    if (signInError) {
      toast({ title: "Invalid Current Password", description: "The current password you entered is incorrect", variant: "destructive" });
      return;
    }

    const { error } = await updatePassword(newPassword);
    if (error) {
      toast({ title: "Update Failed", description: error.message || "Could not update password", variant: "destructive" });
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast({ title: "Password Updated", description: "Your password has been changed successfully" });
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your profile and account</p>
        </div>

        <div className="grid gap-6">
          {/* Username Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Username</CardTitle>
              </div>
              <CardDescription>Set your display name</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveUsername} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username-password">Password</Label>
                  <Input
                    id="username-password"
                    type="password"
                    value={usernamePassword}
                    onChange={(e) => setUsernamePassword(e.target.value)}
                    placeholder="Enter your password to confirm"
                    required
                  />
                </div>
                <Button type="submit" disabled={isSavingUsername}>
                  {isSavingUsername ? 'Saving...' : 'Save Username'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Update Password</CardTitle>
              </div>
              <CardDescription>Change your login password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password (min 8 characters)" required minLength={8} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required />
                </div>
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>

          {/* Logout Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LogOut className="h-5 w-5 text-destructive" />
                <CardTitle>Logout</CardTitle>
              </div>
              <CardDescription>Sign out of your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Logged in as: <span className="font-medium text-foreground">{user?.email}</span>
                </p>
                <Button onClick={handleLogout} variant="destructive" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Account;
