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
    { href: "/ai-builder", label: "AI Builder", icon: ClipboardList, comingSoon: true },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-8 w-8 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg text-gray-900 dark:text-white hidden sm:inline">
                  LacrosseLens
                </span>
              </div>
            </Link>

            {/* Navigation Links - Desktop Only */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                
                if (item.dropdown) {
                  return (
                    <DropdownMenu key={item.label}>
                      <DropdownMenuTrigger asChild>
                        <button className="px-3 py-2 rounded-md flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <span className="text-sm font-medium">{item.label}</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {item.dropdown.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <DropdownMenuItem key={subItem.href} asChild>
                              <Link href={subItem.href}>
                                <span className="flex items-center gap-2 cursor-pointer">
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
                    <div key={item.label} className="px-3 py-2 rounded-md flex items-center gap-2 text-gray-400 cursor-not-allowed">
                      <span className="text-sm font-medium">{item.label}</span>
                      <Badge variant="outline" className="text-xs">Soon</Badge>
                    </div>
                  );
                }
                
                const active = item.href ? isActive(item.href) : false;
                return (
                  <Link key={item.href} href={item.href!}>
                    <div className={`px-3 py-2 rounded-md transition-colors ${
                      active 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}>
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
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // The click will be handled by VideoUpload component
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
            </VideoUpload>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={typedUser?.profileImageUrl} alt={typedUser?.firstName || 'User'} />
                    <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
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
        <div className="lg:hidden fixed inset-0 z-40 bg-white dark:bg-gray-900 mt-14">
          <div className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              if (item.dropdown) {
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {item.label}
                    </div>
                    {item.dropdown.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const active = isActive(subItem.href);
                      return (
                        <Link key={subItem.href} href={subItem.href}>
                          <div 
                            className={`
                              pl-8 pr-4 py-2 rounded-lg flex items-center gap-3 transition-colors cursor-pointer
                              ${active ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
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
                  <div key={item.label} className="px-4 py-2 rounded-lg flex items-center gap-3 text-gray-400">
                    <span className="text-sm">{item.label}</span>
                    <Badge variant="outline" className="text-xs ml-auto">Soon</Badge>
                  </div>
                );
              }
              
              const active = item.href ? isActive(item.href) : false;
              return (
                <Link key={item.href} href={item.href!}>
                  <div 
                    className={`
                      px-4 py-2 rounded-lg flex items-center gap-3 transition-colors cursor-pointer
                      ${active 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
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