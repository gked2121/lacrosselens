import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VideoUpload from "@/components/video-upload";
import { Home, Video, BarChart3, Upload, User, LogOut, Menu, X } from "lucide-react";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const typedUser = user as any;
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/videos", label: "Video Library", icon: Video },
    { href: "/analysis", label: "Analysis", icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ 
      backgroundColor: 'hsl(var(--background) / 0.8)',
      borderBottom: '1px solid hsl(var(--border) / 0.5)',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
    }}>
      <div className="container flex h-14 lg:h-16 items-center justify-between px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden h-9 w-9 p-0"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo and Brand */}
        <div className="flex items-center gap-3 lg:gap-8">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ 
                background: 'linear-gradient(135deg, hsl(259 100% 65%) 0%, hsl(259 100% 55%) 100%)',
                boxShadow: '0 2px 8px hsl(259 100% 65% / 0.25)'
              }}>
                <BarChart3 className="w-5 h-5 lg:w-5.5 lg:h-5.5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg lg:text-xl tracking-tight" style={{ color: 'hsl(var(--foreground))' }}>
                  LacrosseLens
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ 
                  backgroundColor: 'hsl(259 100% 65% / 0.1)', 
                  color: 'hsl(259 100% 65%)',
                  border: '1px solid hsl(259 100% 65% / 0.2)'
                }}>
                  BETA
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links - Desktop Only */}
          <div className="hidden lg:flex items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`
                    px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer
                    ${active 
                      ? 'text-primary font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `} style={{
                    backgroundColor: active ? 'hsl(var(--primary) / 0.08)' : 'transparent',
                  }}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Upload Button and User Menu */}
        <div className="flex items-center gap-3">
          {/* Upload Video Button */}
          <VideoUpload>
            <Button className="hidden sm:flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </Button>
          </VideoUpload>

          <VideoUpload>
            <Button size="icon" className="sm:hidden">
              <Upload className="w-4 h-4" />
            </Button>
          </VideoUpload>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 transition-all" style={{
                border: '2px solid hsl(var(--border))',
                padding: '2px'
              }}>
                <Avatar className="h-9 w-9">
                  <AvatarImage 
                    src={typedUser?.profileImageUrl || ""} 
                    alt={typedUser?.firstName || typedUser?.email || "User"} 
                  />
                  <AvatarFallback className="text-sm font-medium" style={{
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
                    color: 'hsl(var(--primary))'
                  }}>
                    {typedUser?.firstName ? typedUser.firstName.charAt(0).toUpperCase() : typedUser?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56" align="end" forceMount style={{
              marginTop: '8px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)'
            }}>
              <DropdownMenuLabel className="font-normal pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={typedUser?.profileImageUrl || ""} 
                      alt={typedUser?.firstName || typedUser?.email || "User"} 
                    />
                    <AvatarFallback className="text-sm font-medium" style={{
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))'
                    }}>
                      {typedUser?.firstName ? typedUser.firstName.charAt(0).toUpperCase() : typedUser?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-semibold leading-none">
                      {typedUser?.firstName && typedUser?.lastName 
                        ? `${typedUser.firstName} ${typedUser.lastName}`
                        : typedUser?.firstName || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {typedUser?.email || ""}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                <Link href="/profile">
                  <User className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild className="cursor-pointer py-2.5 text-red-600 focus:text-red-600">
                <a href="/api/logout">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Log out</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t" style={{ 
          borderColor: 'hsl(var(--border) / 0.5)',
          backgroundColor: 'hsl(var(--background))'
        }}>
          <div className="container px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={`
                      px-4 py-3 rounded-lg flex items-center gap-3 transition-all
                      ${active 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}