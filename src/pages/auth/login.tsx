import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChefHat, Briefcase, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Separator } from "@/components/ui/separator";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import Layout from "@/components/layout/Layout";

export default function LoginPage() {
  const router = useRouter();
  const { type, redirect } = router.query;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, isAuthenticated, isLoading: authLoading } = useUser();
  const { toast } = useToast();
  const returnUrl = router.query.returnUrl as string || "/";

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirectPath = typeof redirect === 'string' ? redirect : '/';
      router.push(redirectPath);
    }
  }, [isAuthenticated, authLoading, router, redirect]);

  // Handle form submission
  const onSubmit = async (formData: { email: string; password: string }) => {
    setIsLoading(true);
    setError('');
    
    try {
      const { userProfile, dashboardPath } = await login(formData.email, formData.password);
      
      toast({
        title: 'Sign in successful',
        description: `Welcome back, ${userProfile.firstName || 'User'}!`,
      });
      
      // Get the redirect path from the URL query or use the dashboard path
      const redirectPath = router.query.redirect as string || dashboardPath;
      
      // Use router.push for navigation to maintain state
      router.push(redirectPath);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to sign in. Please check your credentials and try again.');
      
      toast({
        title: 'Sign in failed',
        description: error.message || 'Failed to sign in. Please check your credentials and try again.',
        variant: 'destructive',
      });
      
      setIsLoading(false);
    }
  };

  // Handle login form submission
  const handleLogin = async (userType: 'applicant' | 'restaurant') => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Pass the userType to the login function so it can be used to determine the correct dashboard
      const { userProfile, dashboardPath } = await login(email, password);
      
      console.log(`Login successful, user type: ${userProfile.userType}, dashboard path: ${dashboardPath}`);
      
      // If there's a redirect query param, use that instead of the dashboard
      // But never redirect to profile/edit directly after login
      const redirectPath = typeof redirect === 'string' && redirect !== '/profile/edit' 
        ? redirect 
        : dashboardPath;
      
      console.log(`Redirecting to: ${redirectPath}`);
      
      // Use router.push for navigation
      router.push(redirectPath);
    } catch (error: any) {
      // Ensure error message is properly sanitized
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message.replace(/@/g, ' at ');
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      router.push(result.dashboardPath || returnUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = ({ dashboardPath }: { dashboardPath: string }) => {
    router.push(dashboardPath || returnUrl);
  };

  const handleGoogleError = (err: Error) => {
    setError(err.message);
  };

  return (
    <Layout>
      <Head>
        <title>Sign In | StaffSpace</title>
        <meta name='description' content='Sign in to your StaffSpace account to find restaurant jobs or hire talented staff.' />
      </Head>

      <div className='container max-w-md py-12'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold'>Welcome Back</h1>
          <p className='text-muted-foreground mt-2'>Sign in to your StaffSpace account</p>
        </div>

        <Tabs defaultValue={type as string || 'applicant'} className='w-full'>
          <TabsList className='grid grid-cols-2 mb-8'>
            <TabsTrigger value='applicant' className='flex items-center gap-2'>
              <Briefcase className='h-4 w-4' />
              Job Seeker
            </TabsTrigger>
            <TabsTrigger value='restaurant' className='flex items-center gap-2'>
              <ChefHat className='h-4 w-4' />
              Restaurant
            </TabsTrigger>
          </TabsList>

          <TabsContent value='applicant'>
            <Card>
              <CardHeader>
                <CardTitle>Job Seeker Sign In</CardTitle>
                <CardDescription>
                  Sign in to find restaurant and hospitality jobs
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {error && (
                  <Alert variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className='space-y-2'>
                    <Label htmlFor='applicant-email'>Email</Label>
                    <Input
                      id='applicant-email'
                      type='email'
                      placeholder='your.email@example.com'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='applicant-password'>Password</Label>
                      <Link
                        href='/auth/reset-password'
                        className='text-sm text-primary hover:underline'
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id='applicant-password'
                      type='password'
                      placeholder='••••••••'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="mt-4 flex items-center">
                  <Separator className="flex-1" />
                  <span className="mx-2 text-xs text-muted-foreground">OR</span>
                  <Separator className="flex-1" />
                </div>

                <div className="mt-4">
                  <GoogleSignInButton 
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                  />
                </div>
              </CardContent>
              <CardFooter className='flex flex-col gap-4'>
                <p className='text-sm text-center text-muted-foreground'>
                  Don't have an account?{' '}
                  <Link href='/auth/register?type=applicant' className='text-primary hover:underline'>
                    Create account
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value='restaurant'>
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Sign In</CardTitle>
                <CardDescription>
                  Sign in to find talented staff for your restaurant
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {error && (
                  <Alert variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className='space-y-2'>
                  <Label htmlFor='restaurant-email'>Business Email</Label>
                  <Input
                    id='restaurant-email'
                    type='email'
                    placeholder='restaurant@example.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='restaurant-password'>Password</Label>
                    <Link
                      href='/auth/reset-password'
                      className='text-sm text-primary hover:underline'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id='restaurant-password'
                    type='password'
                    placeholder='••••••••'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='restaurant-remember'
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor='restaurant-remember' className='text-sm'>
                    Remember me
                  </Label>
                </div>
              </CardContent>
              <CardFooter className='flex flex-col gap-4'>
                <Button
                  className='w-full'
                  onClick={() => handleLogin('restaurant')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                <p className='text-sm text-center text-muted-foreground'>
                  Don't have an account?{' '}
                  <Link href='/auth/register?type=restaurant' className='text-primary hover:underline'>
                    Create account
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}