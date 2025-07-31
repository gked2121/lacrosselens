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
  ChevronDown,
  MessageCircle,
  ClipboardList
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
    { href: "/ai-chat", label: "AI Chat", icon: MessageCircle, comingSoon: true },
    { href: "/practice-plans", label: "Practice Plan & Workout Builder", icon: ClipboardList, comingSoon: true },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ 
        backgroundColor: 'hsl(var(--background) / 0.98)',
        borderColor: 'hsl(var(--border) / 0.3)',
        boxShadow: '0 1px 20px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.05)'
      }}>
        <div className="max-w-7xl mx-auto flex h-16 lg:h-18 items-center justify-between px-4 lg:px-8">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4 lg:gap-12">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-1" style={{ 
                    background: 'linear-gradient(135deg, hsl(259 100% 65%) 0%, hsl(259 100% 55%) 100%)',
                    boxShadow: '0 4px 12px hsl(259 100% 65% / 0.25), 0 0 0 1px hsl(259 100% 65% / 0.1)'
                  }}>
                    <BarChart3 className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-xl lg:text-2xl tracking-tight hidden sm:inline bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    LacrosseLens
                  </span>
                  <div className="text-xs px-2.5 py-1 rounded-full font-semibold hidden sm:inline border transition-all hover:scale-105" style={{ 
                    backgroundColor: 'hsl(259 100% 65% / 0.08)', 
                    color: 'hsl(259 100% 65%)',
                    borderColor: 'hsl(259 100% 65% / 0.2)',
                    backdropFilter: 'blur(8px)'
                  }}>
                    BETA
                  </div>
                </div>
              </div>
            </Link>

            {/* Navigation Links - Desktop Only */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                
                if (item.dropdown) {
                  return (
                    <DropdownMenu key={item.label}>
                      <DropdownMenuTrigger asChild>
                        <button className="group px-4 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 relative">
                          <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                          <span className="text-sm font-medium">{item.label}</span>
                          <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                        {item.dropdown.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <DropdownMenuItem key={subItem.href} asChild className="rounded-lg">
                              <Link href={subItem.href}>
                                <span className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <SubIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                  </div>
                                  <span className="font-medium">{subItem.label}</span>
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
                    <div key={item.label} className="px-4 py-2.5 rounded-xl flex items-center gap-2.5 opacity-50 cursor-not-allowed relative">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</span>
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Soon</Badge>
                    </div>
                  );
                }
                
                const active = item.href ? isActive(item.href) : false;
                return (
                  <Link key={item.href} href={item.href!}>
                    <div className={`
                      group relative px-4 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 cursor-pointer
                      ${active 
                        ? 'text-primary font-semibold shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }
                    `}>
                      <Icon className={`w-4 h-4 transition-transform ${active ? '' : 'group-hover:scale-110'}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                      {active && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/8 to-primary/4 border border-primary/20"></div>
                      )}
                      {!active && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Upload Button and User Menu */}
          <div className="flex items-center gap-4">
            {/* Upload Video Button */}
            <VideoUpload>
              <Button 
                className="hidden sm:flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 border-0"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // The click will be handled by VideoUpload component
                }}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Video</span>
              </Button>
            </VideoUpload>

            <VideoUpload>
              <Button 
                size="icon" 
                className="sm:hidden h-10 w-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                type="button"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </VideoUpload>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200 group">
                  <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                    <AvatarImage src={typedUser?.profileImageUrl} alt={typedUser?.firstName || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {typedUser?.firstName?.[0] || typedUser?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={typedUser?.profileImageUrl} alt={typedUser?.firstName || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                        {typedUser?.firstName?.[0] || typedUser?.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">
                        {typedUser?.firstName && typedUser?.lastName
                          ? `${typedUser.firstName} ${typedUser.lastName}`
                          : 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {typedUser?.email || 'No email'}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href="/profile">
                    <span className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <span className="font-medium">Profile</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href="/settings">
                    <span className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3">
                        <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <span className="font-medium">Settings</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem asChild className="rounded-lg">
                  <a href="/api/logout" className="cursor-pointer">
                    <span className="flex items-center p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600 dark:text-red-400">
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 flex items-center justify-center mr-3">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <span className="font-medium">Log out</span>
                    </span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/98 backdrop-blur-xl mt-16 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="p-6 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              if (item.dropdown) {
                return (
                  <div key={item.label} className="space-y-3">
                    <div className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </div>
                    {item.dropdown.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const active = isActive(subItem.href);
                      return (
                        <Link key={subItem.href} href={subItem.href}>
                          <div 
                            className={`
                              pl-8 pr-4 py-3 rounded-xl flex items-center gap-4 transition-all cursor-pointer
                              ${active 
                                ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                              }
                            `}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              active ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800'
                            }`}>
                              <SubIcon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">{subItem.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                );
              }
              
              if (item.comingSoon) {
                return (
                  <div key={item.label} className="px-4 py-3 rounded-xl flex items-center gap-4 opacity-50">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                    <Badge variant="secondary" className="text-xs ml-auto">Soon</Badge>
                  </div>
                );
              }
              
              const active = item.href ? isActive(item.href) : false;
              return (
                <Link key={item.href} href={item.href!}>
                  <div 
                    className={`
                      px-4 py-3 rounded-xl flex items-center gap-4 transition-all cursor-pointer
                      ${active 
                        ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      active ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
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