
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Menu, Sun, Moon, Globe, User, LogOut, Shield, Briefcase, ChefHat } from 'lucide-react';
import { useTheme } from 'next-themes';
import Logo from '@/components/common/Logo';
import { useUser } from '@/contexts/UserContext';
import NotificationBell from "@/components/common/NotificationBell";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
];

export default function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
  // Safely access user context with error handling
  let userContextValue;
  let isAuthenticated = false;
  let userProfile = null;
  let user = null;
  let logout = () => Promise.resolve();
  
  try {
    userContextValue = useUser();
    isAuthenticated = userContextValue.isAuthenticated;
    userProfile = userContextValue.userProfile;
    user = userContextValue.user;
    logout = userContextValue.logout;
  } catch (error) {
    console.error("Error accessing user context:", error);
    // Continue with default values
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setCurrentLanguage(langCode);
    // In a real app, you would update the i18n context here
  };

  const handleLogin = (type: 'applicant' | 'restaurant' | 'admin') => {
    if (type === 'admin') {
      router.push(`/auth/admin-login`);
    } else {
      router.push(`/auth/login?type=${type}`);
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  const navigateToDashboard = () => {
    // Navigate to the appropriate dashboard based on user type from userProfile
    if (userProfile?.userType === 'admin') {
      console.log('Navigating to admin dashboard from header');
      router.push('/admin/dashboard');
    } else if (userProfile?.userType === 'restaurant') {
      router.push('/restaurant/dashboard');
    } else if (userProfile?.userType === 'applicant') {
      router.push('/applicant/dashboard');
    }
  };

  if (!mounted) {
    return null;
  }

  // Render a simplified header if user context is not available
  const renderAuthSection = () => {
    if (!mounted) return null;
    
    if (isAuthenticated) {
      return (
        <>
          {userContextValue && <NotificationBell />}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon'>
                <User className='h-5 w-5' />
                <span className='sr-only'>User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile/edit')}>
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={navigateToDashboard}>
                {userProfile?.userType === 'admin' ? (
                  <>
                    <Shield className='h-4 w-4 mr-2' />
                    Admin Dashboard
                  </>
                ) : (
                  'Dashboard'
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/messaging')}>
                Messages
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className='h-4 w-4 mr-2' />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    } else {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='default'>Sign In</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => handleLogin('applicant')}>
              Sign in as Job Seeker
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLogin('restaurant')}>
              Sign in as Restaurant
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLogin('admin')}>
              <Shield className='h-4 w-4 mr-2' />
              Sign in as Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/auth/register')}>
              Create Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='md:hidden'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left'>
              <nav className='flex flex-col gap-4 mt-8'>
                <Link href='/' className='text-lg font-semibold'>
                  Home
                </Link>
                <Link href='/jobs' className='text-lg'>
                  Browse Jobs
                </Link>
                <Link href='/about' className='text-lg'>
                  About Us
                </Link>
                <Link href='/contact' className='text-lg'>
                  Contact
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link href='/' className='flex items-center gap-2'>
            <Logo />
          </Link>
          
          <nav className='hidden md:flex items-center gap-6 ml-6'>
            <Link href='/' className='text-sm font-medium transition-colors hover:text-primary'>
              Home
            </Link>
            <Link href='/jobs' className='text-sm font-medium transition-colors hover:text-primary'>
              Browse Jobs
            </Link>
            <Link href='/about' className='text-sm font-medium transition-colors hover:text-primary'>
              About Us
            </Link>
            <Link href='/contact' className='text-sm font-medium transition-colors hover:text-primary'>
              Contact
            </Link>
          </nav>
        </div>
        
        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon'>
                <Globe className='h-5 w-5' />
                <span className='sr-only'>Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {languages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={currentLanguage === lang.code ? 'bg-muted' : ''}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant='ghost' 
            size='icon'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className='h-5 w-5' />
            ) : (
              <Moon className='h-5 w-5' />
            )}
            <span className='sr-only'>Toggle theme</span>
          </Button>
          
          {renderAuthSection()}
        </div>
      </div>
    </header>
  );
}
