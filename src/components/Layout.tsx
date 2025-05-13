import React, { ReactNode } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Briefcase, UserCog, LogOut, ShieldCheck, LayoutDashboard, UserCircle, LogIn, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const Layout: React.FC = () => {
  const { user, logout, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="mr-2 h-4 w-4" />, authRequired: true, adminRequired: false },
    { to: "/admin", label: "Admin Panel", icon: <ShieldCheck className="mr-2 h-4 w-4" />, authRequired: true, adminRequired: true }, // Placeholder for admin
  ];

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="grid gap-6 text-lg font-medium mt-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Briefcase className="h-6 w-6" />
            <span>AutoApply AI</span>
          </Link>
          {navLinks.map(link => {
            if (link.authRequired && !user) return null;
            // if (link.adminRequired && !isAdmin) return null; // Add isAdmin check later
            return (
              <Link key={link.to} to={link.to} className="hover:text-foreground flex items-center">
                {link.icon} {link.label}
              </Link>
            );
          })}
          {user && (
             <Button onClick={handleLogout} variant="ghost" className="justify-start text-lg">
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          )}
           {!user && (
            <>
              <Link to="/login" className="hover:text-foreground flex items-center">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
              <Link to="/register" className="hover:text-foreground flex items-center">
                <UserPlus className="mr-2 h-4 w-4" /> Register
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <Briefcase className="h-6 w-6" />
            <span className="sr-only">AutoApply AI</span>
            AutoApply AI
          </Link>
          {navLinks.map(link => {
             if (link.authRequired && !user) return null;
            // if (link.adminRequired && !isAdmin) return null; // Add isAdmin check later
            return (
              <Link key={link.to} to={link.to} className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                 {link.icon} {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="md:hidden">
          <MobileNav />
        </div>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial">
            {/* Search bar can go here */}
          </div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={userProfile?.avatar_url || user.user_metadata?.avatar_url} alt={userProfile?.full_name || user.email} />
                    <AvatarFallback>{getInitials(userProfile?.full_name || user.email)}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{userProfile?.full_name || user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}> {/* Adjust route as needed */}
                  <UserCircle className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}> {/* Adjust route as needed */}
                  <UserCog className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Login</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Register</Button>
            </div>
          )}
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
        <Outlet />
      </main>
      <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AutoApply AI. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
