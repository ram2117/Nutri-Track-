
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setSuccess(true);
      toast.success('Reset password email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Error sending reset password email');
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        {!success ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                className="w-full bg-food-green hover:bg-food-green-dark"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              <p className="mt-4 text-center text-sm text-gray-500">
                Remember your password?{' '}
                <Link to="/login" className="text-food-green font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <p className="text-green-800 text-sm">
                We've sent a reset link to your email address. Please check your inbox and follow the instructions.
              </p>
            </div>
            <Button
              className="w-full bg-food-green hover:bg-food-green-dark"
              onClick={() => window.location.href = '/login'}
            >
              Return to Login
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
