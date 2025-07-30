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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VideoUpload from "@/components/video-upload";
import { 
  Home, 
  Video, 
  BarChart3, 
  Upload, 
  User, 
  LogOut, 
  Menu, 
  X,
  Users,
  Target,
  Zap,
  UserCheck,
  Settings,
  ChevronDown
} from "lucide-react";

interface NavItem {
  href?: string;
  label: string;
  icon: any;
  comingSoon?: boolean;
  dropdown?: {
    href: string;
    label: string;
    icon: any;
  }[];
}

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const typedUser = user as any;
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const navItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/videos", label: "Video Library", icon: Video },
    { href: "/teams", label: "Teams", icon: Users, comingSoon: true },
    { 
      label: "Analysis", 
      icon: BarChart3,
      dropdown: [
        { href: "/analysis/faceoffs", label: "Face-Off Analysis", icon: Target },
        { href: "/analysis/transitions", label: "Transition Intelligence", icon: Zap },
        { href: "/analysis/players", label: "Player Evaluation", icon: UserCheck },
      ]
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ 
        backgroundColor: 'hsl(var(--background) / 0.95)',
        borderBottom: '1px solid hsl(var(--border) / 0.5)',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
      }}>
        <div className="max-w-7xl mx-auto flex h-14 lg:h-16 items-center justify-between px-4 lg:px-6">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 lg:gap-10">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-9 w-9 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <Link href="/">
              <div className="flex items-center gap-2.5 cursor-pointer group">
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ 
                  background: 'linear-gradient(135deg, hsl(259 100% 65%) 0%, hsl(259 100% 55%) 100%)',
                  boxShadow: '0 2px 8px hsl(259 100% 65% / 0.25)'
                }}>
                  <BarChart3 className="w-5 h-5 lg:w-5.5 lg:h-5.5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg lg:text-xl tracking-tight hidden sm:inline" style={{ color: 'hsl(var(--foreground))' }}>
                    LacrosseLens
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-medium hidden sm:inline" style={{ 
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
            <div className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                
                if (item.dropdown) {
                  return (
                    <DropdownMenu key={item.label}>
                      <DropdownMenuTrigger asChild>
                        <button className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-muted-foreground hover:text-foreground" style={{
                          backgroundColor: 'transparent',
                        }}>
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {item.dropdown.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <DropdownMenuItem key={subItem.href} asChild>
                              <Link href={subItem.href}>
                                <span className="flex items-center gap-3 cursor-pointer">
                                  <SubIcon className="w-4 h-4" />
                                  <span>{subItem.label}</span>
                                </span>
                              </Link>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                
                if (item.comingSoon) {
                  return (
                    <div key={item.label} className="px-4 py-2 rounded-lg flex items-center gap-2 opacity-50 cursor-not-allowed">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                      <Badge variant="secondary" className="text-xs">Soon</Badge>
                    </div>
                  );
                }
                
                const active = item.href ? isActive(item.href) : false;
                return (
                  <Link key={item.href} href={item.href!}>
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
                      <span className="text-sm font-medium">{item.label}</span>
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
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={typedUser?.profileImageUrl} alt={typedUser?.firstName || 'User'} />
                    <AvatarFallback>
                      {typedUser?.firstName?.[0] || typedUser?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {typedUser?.firstName && typedUser?.lastName
                        ? `${typedUser.firstName} ${typedUser.lastName}`
                        : 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {typedUser?.email || 'No email'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <span className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <span className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm mt-14">
          <div className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              if (item.dropdown) {
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                      {item.label}
                    </div>
                    {item.dropdown.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const active = isActive(subItem.href);
                      return (
                        <Link key={subItem.href} href={subItem.href}>
                          <div 
                            className={`
                              pl-8 pr-4 py-2 rounded-lg flex items-center gap-3 transition-all cursor-pointer
                              ${active ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}
                            `}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <SubIcon className="w-4 h-4" />
                            <span className="text-sm">{subItem.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                );
              }
              
              if (item.comingSoon) {
                return (
                  <div key={item.label} className="px-4 py-2 rounded-lg flex items-center gap-3 opacity-50">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                    <Badge variant="secondary" className="text-xs">Soon</Badge>
                  </div>
                );
              }
              
              const active = item.href ? isActive(item.href) : false;
              return (
                <Link key={item.href} href={item.href!}>
                  <div 
                    className={`
                      px-4 py-2 rounded-lg flex items-center gap-3 transition-all cursor-pointer
                      ${active ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}